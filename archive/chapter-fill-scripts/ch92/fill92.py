#!/usr/bin/env python3
"""Fill the writer TODOs of the generated Chapter 92 content file (re-runnable).

Usage: python3 fill92.py <generated.json> <out.json>
Input is the untouched output of `pnpm tariff:generate-chapter --chapter 92 ...` (gen.json); the data parts
(rate table, matrix totals, trade figures, line statuses) are kept as generated.
"""
import json
import sys

SCRATCH = '/private/tmp/claude-501/-Users-robin-projects-dodao-ui/bc219911-e68f-4899-9a89-7517c8f9e746/scratchpad'
src, out = sys.argv[1], sys.argv[2]
d = json.load(open(src))
pool = json.load(open(f'{SCRATCH}/ch92/pool.json'))

TODAY = '2026-10-13'
CH99 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2099'
CH92 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2092'
CH98 = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=Chapter%2098'
GN = 'https://hts.usitc.gov/reststop/file?release=2026HTSRev21&filename=General%20Notes'
E19 = 'https://www.ecfr.gov/current/title-19/'
E7 = 'https://www.ecfr.gov/current/title-7/'
E50 = 'https://www.ecfr.gov/current/title-50/'
E16 = 'https://www.ecfr.gov/current/title-16/'
E47 = 'https://www.ecfr.gov/current/title-47/'
USC_16_3372 = 'https://www.govinfo.gov/content/pkg/USCODE-2024-title16/html/USCODE-2024-title16-chap53-sec3372.htm'
FWS_2019 = 'https://www.fws.gov/sites/default/files/documents/09-09-2019-Changes-to-CITES-Species-Listings.pdf'
FWS_PB26 = 'https://www.fws.gov/sites/default/files/documents/2026-01/ole-public-bulletin-cites-cop20-amendments-to-appendices-i-and-ii-pb-26-001-01_13_2026.pdf'
FWS_MIC = 'https://www.fws.gov/service/3-200-88-pre-convention-pre-act-antique-musical-instruments-certificate-cites-mmpa-andor'
FWS_PERN = 'https://www.fws.gov/question-answer/pernambuco-cites-annotation-10-implementation-faqs'
FWS_3_200_32 = 'https://www.fws.gov/sites/default/files/documents/3-200-32_CITES_plant_permits_v3(508).pdf'
FWS_WOOD = 'https://www.fws.gov/international-affairs/permits/wood-timber-and-other-tree-products'


def frsrc(id_, citation, document, title, published, url, signed=None):
    return {'id': id_, 'publisher': 'Federal Register', 'citation': citation, 'document': document, 'title': title,
            'signed': signed, 'published': published, 'url': url}


NEW_SOURCES = [
    frsrc('fr-E9-21216', '74 FR 45415', 'Notice (USDA APHIS)', 'Implementation of Revised Lacey Act Provisions', '2009-09-02',
          'https://www.federalregister.gov/documents/2009/09/02/E9-21216/implementation-of-revised-lacey-act-provisions'),
    frsrc('fr-2021-14155', '86 FR 35259', 'Notice (USDA APHIS)', 'Implementation of Revised Lacey Act Provisions', '2021-07-02',
          'https://www.federalregister.gov/documents/2021/07/02/2021-14155/implementation-of-revised-lacey-act-provisions'),
    frsrc('fr-2024-11901', '89 FR 47122', 'Notice (USDA APHIS)', 'Implementation of Revised Lacey Act Provisions', '2024-05-31',
          'https://www.federalregister.gov/documents/2024/05/31/2024-11901/implementation-of-revised-lacey-act-provisions'),
    frsrc('fr-2016-13173', '81 FR 36388', 'Final rule (FWS)',
          'Endangered and Threatened Wildlife and Plants; Revision of the Section 4(d) Rule for the African Elephant (Loxodonta africana)', '2016-06-06',
          'https://www.federalregister.gov/documents/2016/06/06/2016-13173/endangered-and-threatened-wildlife-and-plants-revision-of-the-section-4d-rule-for-the-african'),
    {'id': 'fws-cites-cop18', 'publisher': 'U.S. Fish and Wildlife Service', 'citation': 'FWS notice, September 9, 2019',
     'document': 'Notice to the wildlife import/export community', 'title': 'Changes to CITES Species Listings (CoP18; revised annotation #15 for Dalbergia and Guibourtia)',
     'signed': None, 'published': '2019-09-09', 'url': FWS_2019},
    {'id': 'fws-pb-26-001', 'publisher': 'U.S. Fish and Wildlife Service', 'citation': 'FWS Public Bulletin PB 26-001',
     'document': 'Notice to the wildlife import/export community', 'title': 'CITES CoP20 Amendments to Appendices I and II', 'signed': None,
     'published': '2026-01-13', 'url': FWS_PB26},
    {'id': 'hts-ch92', 'publisher': 'USITC', 'citation': 'HTSUS 2026 Revision 21, Chapter 92', 'document': 'Harmonized Tariff Schedule',
     'title': 'Harmonized Tariff Schedule of the United States (2026 Revision 21), Chapter 92', 'signed': None, 'published': '2026-10-07', 'url': CH92},
]
for sid in ['eo-14193', 'eo-14194', 'eo-14195', 'eo-14228', 'eo-14231', 'eo-14232', 'eo-14257', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14323',
            'eo-14325', 'eo-14326', 'eo-14345', 'eo-14357', 'eo-14389', 'eo-14324', 'eo-14388', 'fr-2026-12670', 'csms-67834313', 'csms-67844987',
            'scotus-24-1287', 'procl-11012', 'ustr-usmca-review', 'ustr-agoa-2026', 'procl-11046', 'procl-11047', 'procl-11048', 'procl-11056',
            'procl-11064', 'procl-11065', 'csms-69606660', 'csms-69851916', 'hts-2025r22-ch99', 'csms-69302472']:
    NEW_SOURCES.append(pool[sid])
SRC = {s['id']: s for s in NEW_SOURCES}

d['asOf'] = TODAY
d['chapter']['title'] = 'Musical instruments; parts and accessories of such articles'
d['sources'] = [
    {'label': 'Harmonized Tariff Schedule of the United States', 'url': 'https://hts.usitc.gov/', 'note': 'rate table rows and Chapter 92 notes (2026 Revision 21)'},
    {'label': 'UN Comtrade', 'url': 'https://comtradeplus.un.org/', 'note': '2020–2025 import figures'},
]

NO_IEEPA = 'The IEEPA duties ended February 24, 2026 and the Section 122 surcharge expired July 23, 2026.'
NO_EXC = 'No Chapter 92 line is on the general exemption list in U.S. note 52(b) or on any note 52(j) country list, so the duty reaches all 63 lines.'

# ---------------------------------------------------------------------------------------------------------------------
# Overview
# ---------------------------------------------------------------------------------------------------------------------
ov = d['overview']
ov['h1'] = 'HTS Chapter 92: Musical Instruments Tariff Rates'
ov['seo'] = {
    'title': 'HTS Chapter 92: Musical Instruments Tariff Rates (Pianos, Guitars, Drums, Keyboards) | KoalaGains',
    'shortDescription': 'Searchable U.S. duty table for all 63 HTS Chapter 92 lines: pianos, guitars, violins, brass and woodwind instruments, drums, electronic keyboards and parts. Base rates up to 8.7%, the 2026 Section 301 duties, China List 4A, Brazil, USMCA, and the CITES and Lacey Act rules for rosewood and ivory.',
    'keywords': ['hts chapter 92', 'musical instruments tariff', 'tariffs on musical instruments', 'acoustic pianos import duty rates', 'china piano import tariffs',
                 'hs code for guitar', 'hs code for musical instruments', 'synthesizers and electronic keyboards import duty', 'tariffs on guitars'],
}
ov['intro'] = (
    'Chapter 92 covers musical instruments and their parts: pianos and harpsichords (9201), guitars, violins, harps and other string instruments (9202), '
    'brass and woodwind instruments, accordions, harmonicas and pipe organs (9205), drums, cymbals and other percussion (9206), electric and electronic '
    'instruments such as electric guitars, digital pianos and synthesizers (9207), music boxes, whistles and decoy calls (9208), and parts, strings, stands and '
    'metronomes (9209). The U.S. imported **$1.39B** of these goods in 2025, 30% from China and 17% from Indonesia. **47 of 63** lines carry a base rate, from '
    '2.6% (accordions) to **8.7%** (guitars over $100); cymbals, bagpipes, harmonicas, piano accordions, strings and most wind-instrument parts are Free.\n\n'
    'On top of the base rate, the **2026 Section 301 duty** (from July 24, 2026) adds 10% or 12.5% for goods of 60 economies, with no product exemption in this '
    'chapter; for the EU and Taiwan it is a 10% floor and for Japan and South Korea a 12.5% floor in place of the lower base rate. **China** also pays the 7.5% '
    'List 4A duty on 58 lines (List 4B, which covers violins, other string instruments, music boxes and some stands, is suspended), so most Chinese instruments '
    'pay **20% to 28.7%**. **Brazil** adds 25%. Canadian and Mexican instruments that qualify for **USMCA** pay nothing; no Chapter 92 line is on the Section 338 '
    'lists for Canada, and no Section 232 or antidumping duty reaches the chapter. Instruments with **rosewood, ivory or tortoiseshell** also face Lacey Act and '
    'CITES rules: see Tariff engineering.'
)
ov['stats'][2]['note'] = ('2026 Section 301: 63 (no product exemption in Chapter 92); Brazil Section 301: 63; China List 4A (7.5%): 58. '
                          'USMCA goods are exempt from the 2026 Section 301 duty; no Section 232, Section 338 or AD/CVD measure reaches the chapter.')

GROUPS = {
    '9201': ('Pianos: upright, grand & harpsichords', 'Pianos',
             'Upright and grand pianos, player pianos, harpsichords and other keyboard stringed instruments: 12 lines at 4.7% (pianos) or 3.5% (other). Statistical lines split pianos by case height or length and separate used pianos. Japan, the biggest supplier, pays the 12.5% Section 301 floor; China pays 4.7% + 7.5% + 12.5% = 24.7%.',
             ['upright piano', 'grand piano', 'acoustic piano', 'player piano', 'harpsichord', 'used piano']),
    '9202': ('Guitars, violins & other string instruments', 'Guitars & violins',
             'String instruments played with a bow (violins, violas, cellos, double basses, 3.2%) and other string instruments: acoustic guitars valued up to $100 without the case (4.5%) or over $100 (8.7%, the highest base rate in the chapter), and harps, mandolins, ukuleles and banjos (4.6%). Bowed instruments and 9202.90.60 are on China\'s suspended List 4B, so China pays only the 12.5% Section 301 duty on them.',
             ['acoustic guitar', 'classical guitar', 'violin', 'cello', 'ukulele', 'banjo', 'harp']),
    '9205': ('Brass, woodwind, accordions & pipe organs', 'Wind instruments',
             'Wind instruments: brass (trumpets, trombones, horns, tubas; 2.9%), clarinets, saxophones and flutes (4.9%), harmoniums (2.7%), accordions (2.6%), and Free keyboard pipe organs, piano accordions, harmonicas (mouth organs), bagpipes and other wind instruments.',
             ['trumpet', 'saxophone', 'clarinet', 'flute', 'trombone', 'harmonica', 'accordion', 'pipe organ']),
    '9206': ('Drums, cymbals & percussion', 'Percussion',
             'Percussion instruments: drums (4.8%), cymbals (Free), chimes, peals and carillons (Free) and other percussion such as xylophones, tambourines, castanets and maracas (5.3%). Electronic drum kits are heading 9207.',
             ['drum set', 'snare drum', 'cymbals', 'xylophone', 'tambourine', 'cajon', 'handbells']),
    '9207': ('Electric guitars, digital pianos, keyboards & synths', 'Electric & electronic',
             'Instruments whose sound is produced or must be amplified electrically: keyboard instruments such as digital pianos, synthesizers and electronic organs (5.4%; 2.7% for Japan under the U.S.-Japan agreement, though Japan pays the 12.5% floor), and electric guitars, basses and other electric instruments (5%). The largest group: $552M in 2025.',
             ['electric guitar', 'digital piano', 'synthesizer', 'electronic keyboard', 'bass guitar', 'electronic drums']),
    '9208': ('Music boxes, whistles & decoy calls', 'Music boxes & whistles',
             'Music boxes (3.2%) and other instruments not elsewhere covered: musical saws, mechanical organs, whistles, call horns and decoy calls of all kinds (5.3%). Music boxes are on China\'s suspended List 4B.',
             ['music box', 'whistle', 'duck call', 'game call', 'kazoo']),
    '9209': ('Parts, strings, stands, metronomes & tuners', 'Parts & accessories',
             'Parts and accessories: instrument strings (Free), piano parts and tuning pins, guitar and violin parts, bows and chin rests (Free), mutes, drum pedals, music holders and collapsible stands (3.9% to 5.7%), parts for electric instruments (2.7%), and metronomes, tuning forks and pitch pipes (Free). Wind-instrument and music-box parts are Free.',
             ['guitar strings', 'piano parts', 'guitar parts', 'violin bow', 'drum pedal', 'music stand', 'metronome']),
}
for g in ov['productGroups']:
    label, short, blurb, ex = GROUPS[g['heading']]
    g['label'], g['blurb'], g['searchExamples'] = label, blurb, ex
for g in d['industryAreas']['groups']:
    g['label'], g['shortLabel'] = GROUPS[g['heading']][0], GROUPS[g['heading']][1]

ov['workedExamples'] = [
    {'title': '$100,000 of electric guitars from China', 'line': '9207.90.00.40',
     'body': 'Fretted electric string instruments have a **5%** base rate. China adds **7.5%** under Section 301 List 4A (9903.88.15) and **12.5%** under the 2026 Section 301 action (9903.05.31): **25%**, or **$25,000**. The List 4A exclusion for electric guitar kits has expired. Electric guitars of 9207.90.00.40 also need a Lacey Act plant declaration for their wood (phase VI, since October 1, 2021).'},
    {'title': '$50,000 of acoustic guitars from Indonesia, over $100 each', 'line': '9202.90.40.00',
     'body': 'Guitars valued over $100 each, **excluding the value of the case**, have an **8.7%** base rate; at $100 or less they fall in 9202.90.20 at **4.5%**. Indonesia\'s 2026 Section 301 duty (9903.05.45) adds **10%**: **18.7%**, or **$9,350**. Declare the unit value without the case, since a case entered with the guitar is classified with it but does not count toward the $100 break.'},
    {'title': 'A grand piano from Japan', 'line': '9201.20.00.31',
     'body': 'Grand pianos have a **4.7%** general rate and are Free under the U.S.-Japan Trade Agreement (SPI JP). Since July 24, 2026 Japanese goods with a column 1 rate under 12.5% pay a flat **12.5%** in place of it (9903.05.49), so a $60,000 grand piano pays **$7,500** whether or not the agreement is claimed. Before July 2026 the same piano paid the 15% all-in reciprocal rate (until February 24, 2026) and then the 10% Section 122 surcharge (until July 23, 2026).'},
    {'title': 'Digital pianos and keyboards from China vs Malaysia vs Mexico', 'line': '9207.10.00.75',
     'body': 'Keyboard instruments of 9207.10 have a **5.4%** base rate. From **China** they pay 5.4% + 7.5% (List 4A) + 12.5% = **25.4%**; from **Malaysia** 5.4% + 10% (9903.05.54) = **15.4%**; from **Mexico** they are **Free** with a USMCA certification of origin and 15.4% without (5.4% + 10%, 9903.05.55).'},
    {'title': 'A violin from China', 'line': '9202.10.00.00',
     'body': 'Bowed string instruments have a **3.2%** base rate. 9202.10 is on Section 301 List 4B (9903.88.16), which is suspended (U.S. note 20(t)–(u)), so a Chinese violin pays only 3.2% + **12.5%** (9903.05.31) = **15.7%**. A bow entered with the violin in normal numbers is classified with it (Chapter 92 note 2). A violin with an ivory fitting or a pernambuco bow needs CITES and FWS clearance as well.'},
]
ov['tradeSnapshot']['biggestLines'] = [
    {'hts': '9207.90', 'label': 'Electric guitars, basses and other electric instruments (not keyboards)'},
    {'hts': '9207.10', 'label': 'Digital pianos, synthesizers and other electronic keyboard instruments'},
    {'hts': '9202.90', 'label': 'Acoustic guitars, harps, ukuleles and other string instruments not played with a bow'},
]
ov['tradeSnapshot']['coverageNote'] = 'Values are CIF (customs value plus freight and insurance), as reported by the United States to UN Comtrade.'
ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** This chapter does not cover: (a) parts of general use of base metal (Section XV) or similar goods of plastics (Chapter 39); (b) microphones, '
        'amplifiers, loudspeakers, headphones, switches, stroboscopes or other accessory instruments of Chapter 85 or 90 for use with but not incorporated in or housed '
        'in the same cabinet as instruments of this chapter; (c) toy instruments (heading 9503); (d) brushes for cleaning musical instruments (heading 9603), or '
        'monopods, bipods, tripods and similar articles (heading 9620); or (e) collectors\' pieces or antiques (heading 9705 or 9706).\n\n'
        '**Note 2.** Bows and sticks and similar devices used in playing the instruments of heading 9202 or 9206, entered with those instruments in normal numbers and '
        'clearly intended for use with them, are classified in the same heading as the instruments. Cards, discs and rolls of heading 9209 entered with an instrument '
        'are treated as separate articles.\n\n'
        '**Statistical notes.** Under 9201.10 the height of an upright piano case is measured from the floor to the top of the back of the case; under 9201.20 the length '
        'of a grand piano case is measured from the front edge of the cabinet in front of the keys to the farthest point at the center of the rim tail.'
    ),
    'additionalUsNotes': None,
}

# ---------------------------------------------------------------------------------------------------------------------
# Tariff updates
# ---------------------------------------------------------------------------------------------------------------------
tu = d['tariffUpdates']
tu['h1'] = 'HTS Chapter 92: Musical Instruments Tariff Rates — Tariff Updates'
tu['seo'] = {
    'title': 'Musical Instrument Tariff Updates 2025–2026: China, Section 301, IEEPA, USMCA (HTS Ch. 92) | KoalaGains',
    'shortDescription': 'What changed for U.S. imports of pianos, guitars, drums, wind instruments and keyboards since January 2025: the IEEPA duties and their end, the Section 122 surcharge, the 2026 Section 301 duties on 60 economies, Brazil, China List 4A, and the CITES and Lacey Act changes, with official citations.',
    'keywords': ['hts chapter 92 import duty rates', 'tariffs on musical instruments 2026', 'section 301 tariffs on pianos', 'china tariff on musical instruments',
                 'indonesia musical instruments import duty', 'trump tariffs on instruments', 'cites musical instruments'],
}
tu['intro'] = (
    'This page compares two editions of the tariff schedule: the **2025 Basic Edition**, in force at the start of 2025, and the current **2026 Revision 21** '
    '(in force October 9, 2026). The base rates of all 63 Chapter 92 lines are unchanged.\n\n'
    'The extra duties changed a lot. In 2025 musical instruments paid every IEEPA duty in full, since no Chapter 92 line was on an exemption annex: 25% on '
    'non-USMCA goods of Canada (35% from August 1) and Mexico, 10% to 20% fentanyl duties and a reciprocal duty on China, the reciprocal tariff on everyone '
    'else (country rates from August 7, 2025, for example 19% for Indonesia and Malaysia, 20% for Vietnam and 15% all-in for the EU and Japan), and 40% on Brazil. '
    'All IEEPA duties **ended on February 24, 2026**; the 10% **Section 122** surcharge that replaced them expired on **July 23, 2026**.\n\n'
    'Today three measures apply: the **2026 Section 301 duties** on 60 economies (from July 24, 2026, no product exemption in this chapter), **Brazil\'s 25% '
    'Section 301 duty** (from July 22, 2026), and China\'s Section 301 **List 4A** duty of 7.5% on 58 lines, which USTR continued on October 7, 2026. No Section 232, '
    'Section 338 or antidumping/countervailing duty reaches Chapter 92. Wildlife and plant rules changed too: CITES exempted finished instruments of rosewood '
    'from November 26, 2019, and amended the pernambuco (bow wood) listing from March 5, 2026.'
)
tu['scope'] = ('Chapter 99 measures that reach Chapter 92 from any country (2026 Section 301 on 60 economies, Brazil Section 301, China Section 301 List 4A; the ended '
               'IEEPA and Section 122 duties; the Section 338 lists on Canada, which name no Chapter 92 line), plus the FWS (CITES, ivory) and APHIS (Lacey Act) changes '
               'that affect instrument imports. No antidumping or countervailing duty order covers Chapter 92 goods. For the rate each supplier pays, see Rates by country.')
tu['lastCheckedAt'] = TODAY
tu['stats'] = [
    {'label': 'Base rates unchanged', 'value': '63 of 63 lines', 'note': '2025 Basic Edition → 2026 Revision 21'},
    {'label': 'Extra-duty programs in effect', 'value': '3', 'note': '2026 Section 301, Brazil Section 301, China List 4A'},
    {'label': 'China, most lines', 'value': '+20%', 'note': '7.5% List 4A + 12.5% 2026 Section 301; 12.5% on 5 List 4B lines'},
    {'label': 'IEEPA duties', 'value': 'Ended', 'note': 'February 24, 2026; Section 122 expired July 23, 2026'},
]

S301 = ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now']
WHAT = {
    'cn-section-301': ('Most Chinese instruments pay 20% plus the base rate: 24.7% on pianos, 25% on electric guitars, 25.4% on digital pianos and keyboards, 28.7% on acoustic guitars over $100. Violins, other bowed and plucked string instruments of 9202.90.60, music boxes and two kinds of collapsible stands pay 12.5% plus the base rate.',
                       'The 7.5% List 4A duty (9903.88.15, U.S. note 20(r)–(s)) covers 58 of 63 lines; the other 5 (9202.10, 9202.90.60, 9208.10, 9209.92.20, 9209.94.40) are on List 4B (9903.88.16), which is suspended. The List 4A product exclusions for acoustic pianos, acoustic guitars valued up to $100, harp sharping levers, electric guitar kits and synthesizer circuit boards (U.S. note 20) have all expired. No Chapter 92 line is on List 3. Note 52(a) keeps the List 4A duty on top of the 12.5%. ' + NO_EXC + ' The IEEPA duties on China ended February 24, 2026.'),
    'id-section-301': ('Indonesian digital pianos and keyboards pay 15.4%, electric guitars 15%, acoustic guitars over $100 18.7% and upright pianos 14.7%.',
                       NO_EXC + ' ' + NO_IEEPA),
    'jp-section-301': ('Japanese pianos, brass and woodwind instruments, keyboards and parts all pay 12.5% in total, even lines that are Free under the U.S.-Japan Trade Agreement.',
                       'The duty is a flat 12.5% in place of any column 1 rate under 12.5%, which covers every Chapter 92 line. ' + NO_EXC + ' ' + NO_IEEPA),
    'mx-section-301': ('Mexican guitars and electric instruments, the bulk of what Mexico ships, are Free with a USMCA certification of origin; without one they pay 10% plus the base rate (18.7% on guitars over $100).',
                       'Goods entered free under USMCA are exempt under U.S. note 52(h) (9903.05.94). ' + NO_EXC + ' ' + NO_IEEPA),
    'tw-section-301': ('Taiwanese wind instruments, drums and parts pay 10% in total, because every Chapter 92 base rate is under 10%. UN Comtrade reports Taiwan as "Other Asia, nes".',
                       'The duty is a flat 10% in place of any column 1 rate under 10%. ' + NO_EXC + ' Taiwan\'s note 52(j) list (9903.06.14) names no Chapter 92 line. ' + NO_IEEPA),
    'my-section-301': ('Malaysian keyboards and electric instruments pay 10% plus the 5% to 5.4% base rate.',
                       NO_EXC + ' Malaysia\'s note 52(j) list (9903.05.99) names no Chapter 92 line. ' + NO_IEEPA),
    'eu-section-301': ('German, Italian, French, Austrian and other EU pianos, brass and woodwind instruments and accordions pay 10% in total, because every Chapter 92 base rate is under 10%.',
                       'The duty is a flat 10% in place of any column 1 rate under 10%. ' + NO_EXC + ' No Chapter 92 line is on the EU list in note 52(j)(2). ' + NO_IEEPA),
    'ca-section-301': ('Canadian drums, parts and other instruments are Free with a USMCA claim and pay 10% plus the base rate without one.',
                       'Goods entered free under USMCA are exempt under U.S. note 52(g) (9903.05.93). No Chapter 92 line is on the Section 338 lists in U.S. note 51(b) (9903.03.12–9903.03.14), so the 50% Section 338 duty does not reach Canadian instruments. ' + NO_EXC + ' ' + NO_IEEPA),
    'kr-section-301': ('Korean keyboards, electric instruments and parts pay 12.5% in total.',
                       'The duty is a flat 12.5% in place of any column 1 rate under 12.5%. A KORUS claim does not change it. ' + NO_EXC + ' ' + NO_IEEPA),
    'gb-section-301': ('British instruments pay 10% plus the base rate, for example 14.7% on pianos and 13.2% on violins.',
                       NO_EXC + ' ' + NO_IEEPA),
    'vn-section-301': ('Vietnamese guitars, drums and parts pay 12.5% plus the base rate, for example 21.2% on acoustic guitars over $100.',
                       NO_EXC + ' ' + NO_IEEPA),
    'br-section-301': ('Brazilian instruments, mainly parts and drums, pay 37.5% plus the base rate.',
                       'The 25% Brazil duty (9903.05.01, U.S. note 50) and the 12.5% 2026 Section 301 duty (9903.05.27) both apply: no Chapter 92 line is on the Brazil exemption list in note 50(a)(ii) or on note 52(b). The 2025 IEEPA duties on Brazil (40% and 10%) ended February 24, 2026.'),
    'in-section-301': ('Indian percussion, harmoniums and other instruments pay 10% plus the base rate.',
                       NO_EXC + ' ' + NO_IEEPA),
    'other-section-301': ('Instruments from the other listed economies pay 10% or 12.5% plus the base rate, for example Thailand, the Philippines and Singapore 12.5%; Switzerland pays a 12.5% floor. Countries outside the 60 economies pay only the base rate.',
                          NO_EXC + ' Russia pays column 2 rates (35% to 50%) plus 12.5%; Nicaragua\'s separate Section 301 duty (9903.89.01) is 0% until January 1, 2027. ' + NO_IEEPA),
}
for e in tu['inEffect']:
    w, ex = WHAT[e['id']]
    e['whatItMeans'], e['exemption'] = w, ex
    if e['id'] == 'cn-section-301':
        e['measure'] = 'Section 301 (2026, 60 economies) + Section 301 List 4A (2019)'
        e['before'] = '+7.5% (List 4A)'
        e['now'] = '+20% (12.5% on 5 List 4B lines)'
    if e['id'] == 'br-section-301':
        e['effectiveFrom'] = '2026-07-24'
    if e['id'] == 'eu-section-301':
        e['country'] = 'European Union (e.g. Germany, Italy, France, Austria)'
    if e['id'] == 'tw-section-301':
        e['country'] = 'Taiwan'

C = []


def ch(id_, type_, date, label, title, detail, before, now, countries, sids):
    C.append({'id': id_, 'type': type_, 'date': date, 'dateLabel': label, 'title': title, 'detail': detail, 'before': before, 'now': now,
              'countries': countries, 'sourceIds': sids})


ch('base-rates', 'baseRate', TODAY, 'Checked', 'Chapter 92 base rates: no changes',
   'All 63 Chapter 92 tariff lines carry the same General, Special and Column 2 rates in the 2026 Revision 21 as in the 2025 Basic Edition.',
   None, None, None, ['hts-before', 'hts-now', 'hts-now-cr'])
ch('cn-301-continued', 'reference', '2026-10-07', 'Published', 'China Section 301 actions continue during the four-year review',
   'USTR announced that the Section 301 actions on China, including the 7.5% List 4A duty on 58 Chapter 92 lines, continue while the review proceeds. No Chapter 92 product exclusion is in effect.',
   '+7.5%', '+7.5%', 'China', ['fr-2026-20510', 'hts-chapter-99'])
ch('section-338-canada', 'reference', '2026-08-22', 'Effective', 'Section 338 on Canada: no Chapter 92 lines',
   'Proclamations 11046 to 11048 imposed a 50% duty on products of Canada on the lists in U.S. note 51(b), applied from August 22, 2026 (Proclamation 11056) and changed from September 15, 2026 (Proclamations 11064 and 11065). None of the lists names a Chapter 92 line, so Canadian instruments stay Free with a USMCA claim.',
   None, None, 'Canada', ['procl-11046', 'procl-11047', 'procl-11048', 'procl-11056', 'procl-11064', 'procl-11065', 'csms-69606660', 'csms-69851916', 'hts-chapter-99'])
ch('section-301-2026-60-economies-2026-07-24', 'extraDuty', '2026-07-24', 'Effective', '2026 Section 301 duties on 60 economies',
   'The 10% or 12.5% Section 301 duties on 60 economies (9903.05.20–9903.05.84) took effect and reach all 63 Chapter 92 lines: no instrument is on the general exemption list (U.S. note 52(b)) or a note 52(j) country list. For the EU and Taiwan the duty is a 10% floor and for Japan, South Korea and Switzerland a 12.5% floor in place of the lower base rate. Canadian and Mexican goods entered under USMCA are exempt (notes 52(g)–(h)), and the China List 4A duty stays on top (note 52(a)).',
   None, '+10% to +12.5%', '60 economies', ['fr-2026-15181', 'fr-2026-15274', 'hts-chapter-99', 'hts-now'])
ch('s122-end', 'extraDuty', '2026-07-23', 'Expired', 'Section 122 surcharge expired',
   'The 150-day 10% surcharge (9903.03.01) expired at the close of July 23, 2026.',
   '+10%', 'None', 'All', ['procl-11012', 'hts-chapter-99'])
ch('section-301-brazil-2026-07-22', 'extraDuty', '2026-07-22', 'Effective', 'Brazil Section 301: 25% on all Chapter 92 goods',
   'The 25% Section 301 duty on goods of Brazil (9903.05.01) took effect. No Chapter 92 line is on its exemption list (U.S. note 50(a)(ii)), so it reaches all 63 lines and stacks with the 12.5% 2026 Section 301 duty from July 24.',
   'None', '+25%', 'Brazil', ['fr-2026-14542', 'csms-69302472', 'hts-chapter-99', 'hts-now'])
ch('usmca-review', 'reference', '2026-07-01', 'Announced', 'USMCA joint review: not renewed, still in force',
   'The United States did not agree to renew the USMCA in its current form. USTR said the Agreement remains in force pending resolution of the issues or until termination, so USMCA claims (SPI S) still make Canadian and Mexican instruments Free.',
   None, None, 'Canada, Mexico', ['ustr-usmca-review'])
ch('de-minimis', 'reference', '2026-06-24', 'Effective', 'De minimis suspension made indefinite',
   'The $800 duty-free de minimis exemption has been suspended for all countries since August 29, 2025 (Executive Order 14324), kept after the IEEPA ruling (Executive Order 14388), and suspended indefinitely for all modes other than the postal network by CBP\'s interim final rule of June 24, 2026. Low-value parcels of strings, picks and other parts need an entry and pay the full duty.',
   'Free under $800', 'Full duty, any value', 'All', ['eo-14324', 'eo-14388', 'fr-2026-12670'])
ch('cites-cop20-pernambuco', 'reference', '2026-03-05', 'Effective', 'CITES: pernambuco (bow wood) listing amended',
   'The CoP20 amendments took effect. Annotation #10 for pernambuco (Paubrasilia echinata), the wood of most fine violin bows, now covers all parts and derivatives except finished instruments, parts and accessories moved non-commercially (performance, personal use, repair and similar) without a change of ownership, with a zero quota for wild-harvested specimens traded commercially. Commercial imports of new pernambuco bows need a pre-Convention certificate or a CITES permit for a non-wild source.',
   None, None, 'All', ['fws-pb-26-001'])
ch('s122-start', 'extraDuty', '2026-02-24', 'Effective', 'Section 122 surcharge replaces the IEEPA tariffs',
   'A 10% surcharge on products of all countries (9903.03.01) applied until July 23, 2026, to every Chapter 92 line. Canadian and Mexican goods entered under USMCA were exempt (9903.03.07, 9903.03.08).',
   'Varied by country', '+10% (ended)', 'All', ['procl-11012', 'csms-67844987', 'hts-chapter-99'])
ch('ieepa-end', 'extraDuty', '2026-02-24', 'Effective', 'All IEEPA tariffs end',
   'After the Supreme Court held on February 20, 2026 (Learning Resources, Inc. v. Trump) that IEEPA does not authorize tariffs, Executive Order 14389 ended the Canada, Mexico, China, Brazil and reciprocal duties, and CBP stopped collecting them for goods entered from 12:01 a.m. ET on February 24, 2026.',
   'Varied by country', 'None', 'All', ['scotus-24-1287', 'eo-14389', 'csms-67834313'])
ch('agoa-renewed', 'reference', '2026-02-03', 'Announced', 'AGOA reauthorized',
   'AGOA was reauthorized through December 31, 2026, retroactive to September 30, 2025. Every dutiable Chapter 92 line is Free under AGOA (SPI D) for eligible sub-Saharan African countries; GSP (SPI A) stays expired.',
   None, None, 'AGOA countries', ['ustr-agoa-2026'])
ch('section-301-nicaragua-scheduled-2027-01-01', 'pending', '2025-12-12', 'Announced', 'Section 301 tariff on Nicaragua phases in from 2027',
   'Products of Nicaragua that are not CAFTA-DR originating goods will pay +10% from January 1, 2027 and +15% from January 1, 2028 (9903.89.01, U.S. note 29), on every Chapter 92 line. The rate is 0% in 2026.',
   None, '+10% to +15%', 'Nicaragua', ['fr-2025-22690', 'fr-2025-23892', 'hts-chapter-99', 'hts-now'])
ch('jp-agreement', 'extraDuty', '2025-09-04', 'Signed', 'Japan: 15% all-in reciprocal rate',
   'Executive Order 14345 set the reciprocal duty on Japanese goods to 15% including the base rate, retroactive to goods entered from August 7, 2025,, so Japanese pianos, wind instruments and keyboards paid 15% in all until February 24, 2026.',
   '+15%', '15% all-in (ended)', 'Japan', ['eo-14345'])
ch('de-minimis-suspended', 'reference', '2025-08-29', 'Effective', 'De minimis exemption suspended for all countries',
   'Executive Order 14324 ended duty-free entry for shipments valued at $800 or less from every country, effective for goods entered from August 29, 2025.',
   'Free under $800', 'Dutiable', 'All', ['eo-14324'])
ch('reciprocal-country-rates', 'extraDuty', '2025-08-07', 'Effective', 'Country-specific reciprocal rates take effect',
   'Executive Order 14326 replaced the 10% baseline with country-specific reciprocal rates for many partners, for example 19% for Indonesia and Malaysia, 20% for Vietnam, 15% all-in for the EU and Japan, and 10% for the United Kingdom. Every Chapter 92 line paid them. Ended February 24, 2026.',
   '+10%', 'Country rates (ended)', 'All except Canada, Mexico', ['eo-14326'])
ch('brazil-ieepa-40', 'extraDuty', '2025-08-06', 'Effective', 'Brazil: 40% IEEPA duty',
   'Executive Order 14323 added a 40% duty on products of Brazil (9903.01.77) on top of the 10% reciprocal duty. No Chapter 92 line was on its Annex I exceptions (U.S. note 2(x)(iii)). Ended February 24, 2026.',
   'None', '+40% (ended)', 'Brazil', ['eo-14323', 'hts-2025r22-ch99'])
ch('ca-amended', 'extraDuty', '2025-08-01', 'Effective', 'Canada additional duty raised to 35%',
   'Raised the IEEPA duty on non-USMCA Canadian goods from 25% to 35% (9903.01.10). Ended February 24, 2026.',
   '+25%', '+35% (ended)', 'Canada', ['eo-14325'])
ch('cn-ieepa', 'extraDuty', '2025-05-14', 'Effective', 'China IEEPA duties: reciprocal rate cut to 10%',
   'Chinese instruments paid IEEPA duties on top of Section 301: a fentanyl-related 10% from February 4, 2025 (20% from March 4, back to 10% from November 10, 2025) and a reciprocal duty that rose to 125% in April 2025 and was cut to 10% from May 14, 2025. A Chinese electric guitar paid 5% + 7.5% + 20% + 10% = 42.5% in mid-2025. All ended February 24, 2026.',
   '+125% reciprocal', '+10% reciprocal (ended)', 'China', ['eo-14195', 'eo-14228', 'eo-14259', 'eo-14266', 'eo-14298', 'eo-14357'])
ch('reciprocal', 'extraDuty', '2025-04-05', 'Effective', 'Reciprocal tariff: 10% baseline on all Chapter 92 goods',
   '10% baseline (9903.01.25) on products of all countries except Canada and Mexico from April 5, 2025. No Chapter 92 line was on Annex II (U.S. note 2(v)(iii)), so every instrument paid it. Ended February 24, 2026.',
   'None', '+10% or more (ended)', 'All except Canada, Mexico', ['eo-14257', 'hts-2025r22-ch99'])
ch('usmca-exempt', 'extraDuty', '2025-03-06', 'Signed', 'USMCA goods exempted from the Canada and Mexico duties',
   'From March 7, 2025, goods entered under USMCA were exempt from the IEEPA duties on Canada and Mexico. Ended February 24, 2026.',
   '+25%', '+25%, USMCA goods exempt (ended)', 'Canada, Mexico', ['eo-14231', 'eo-14232'])
ch('ca-mx-imposed', 'extraDuty', '2025-02-01', 'Signed', 'Additional duties on products of Canada and Mexico',
   '+25% on goods of Canada (9903.01.10) and Mexico (9903.01.01), in force from March 4, 2025. Ended February 24, 2026.',
   'None', '+25% (ended)', 'Canada, Mexico', ['eo-14193', 'eo-14194'])
ch('lacey-phase-vi', 'reference', '2021-10-01', 'Effective', 'Lacey Act declaration extended to drums, woodwinds and electric guitars',
   'APHIS began enforcing the plant import declaration for bagpipes, clarinets, flutes and other woodwinds (9205.90.20, 9205.90.40), drums (9206.00.20), fretted electric string instruments (9207.90.00.40), parts of string instruments (9209.92) and of bagpipes and woodwinds, and other parts (9209.99.80). Pianos and acoustic string instruments (9201, 9202) have been covered since April 1, 2010. A further phase proposed in May 2024 (pipe organs, harmoniums, accordions, harmonicas, piano parts, metronomes, mutes and stands) has no start date yet.',
   None, None, 'All', ['fr-2021-14155', 'fr-E9-21216', 'fr-2024-11901'])
ch('cn-4a-cut', 'extraDuty', '2020-02-14', 'Effective', 'China List 4A duty cut to 7.5%',
   'USTR halved the List 4A duty (9903.88.15) from 15% to 7.5%. List 4A took effect September 1, 2019 and covers 58 Chapter 92 lines; List 4B (violins, other string instruments, music boxes and some stands) was suspended before it took effect.',
   '+15%', '+7.5%', 'China', ['fr-2020-00904', 'fr-2019-17865'])
ch('cites-rosewood-2019', 'reference', '2019-11-26', 'Effective', 'CITES: finished instruments of rosewood exempted',
   'The CoP18 revision of annotation #15 for Dalbergia rosewoods and bubinga (Guibourtia demeusei, G. pellegriniana, G. tessmannii) exempts finished musical instruments, finished instrument parts and finished accessories, as referenced by HS Chapter 92, from CITES documents. Brazilian rosewood (Dalbergia nigra) remains in Appendix I and is not covered by the exemption.',
   'CITES permit for any rosewood item', 'Finished instruments exempt', 'All', ['fws-cites-cop18'])
tu['changes'] = C

have = {s['id'] for s in tu['sources']}
for s in NEW_SOURCES:
    if s['id'] not in have:
        tu['sources'].append(s)
        have.add(s['id'])

# ---------------------------------------------------------------------------------------------------------------------
# Understand industry
# ---------------------------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
ui['h1'] = 'HTS Chapter 92: Musical Instruments — U.S. Import Statistics'
ui['seo'] = {
    'title': 'U.S. Musical Instrument Imports by Country: China, Indonesia, Japan, Mexico (HTS Ch. 92) | KoalaGains',
    'shortDescription': 'Where U.S. imports of pianos, guitars, wind instruments, drums and electronic keyboards come from, 2020–2025: $1.39B in 2025, down 15.2%, 30% from China. By country, by product and over time, from UN Comtrade.',
    'keywords': ['musical instrument imports by country', 'us musical instrument imports', 'guitar imports from china', 'piano imports from japan',
                 'hts chapter 92 import statistics', 'musical instruments import data'],
}
for s in ui['stats']:
    if s['label'] == 'Largest product':
        s['note'] = 'Electric guitars, basses and other electric instruments (9207.90)'
ui['why'] = (
    'U.S. imports of Chapter 92 goods were **$1.39B in 2025**, down 15.2% from $1.64B in 2024 and well below the 2022 peak of $1.98B. **China** supplied $421M (30%), '
    'down 28.5% in a year of IEEPA duties that reached 42.5% on a Chinese electric guitar: mostly electric instruments and keyboards ($172M), acoustic guitars ($71M), '
    'wind instruments ($67M) and parts ($63M). **Indonesia** ($233M, 17%) ships mostly digital pianos, keyboards and electric instruments ($162M) plus acoustic guitars '
    'and pianos; **Japan** ($135M) pianos ($46M) and wind instruments ($45M); **Mexico** ($119M, the only large supplier that grew) electric instruments ($54M) and '
    'guitars ($53M), mostly Free under USMCA. Taiwan, reported by Comtrade as "Other Asia, nes" ($84M), ships wind instruments, drums and parts; **Malaysia** ($60M) '
    'electric instruments; **Germany** ($59M) parts, pianos and wind instruments.\n\n'
    'By product, electric instruments lead: 9207.90 (electric guitars and basses) was $349M and 9207.10 (digital pianos and synthesizers) $203M, together 40% of the '
    'chapter. Brass instruments (9205.10, down 30.9%), other wind instruments (9205.90, down 27.9%) and grand pianos (9201.20, down 25.2%) fell the most; strings '
    '(9209.30, up 20.8%) and upright pianos rose.\n\n'
    '2025 is the latest full year of U.S. trade data, so the figures show the IEEPA duties but not the 2026 Section 301 and Brazil duties. '
    'Duty-collected figures aren\'t available from an official source yet.'
)

# ---------------------------------------------------------------------------------------------------------------------
# Industry areas (rates by country)
# ---------------------------------------------------------------------------------------------------------------------
ia = d['industryAreas']
ia['seo'] = {
    'title': 'Musical Instrument Tariff Rates by Country: China, Indonesia, Japan, Mexico, Taiwan (HTS Ch. 92) | KoalaGains',
    'shortDescription': 'The total U.S. tariff on pianos, guitars, wind instruments, drums, keyboards and parts by country: 20% to 28.7% from China, 10% plus base from Indonesia, 12.5% flat from Japan and Korea, 10% flat from the EU and Taiwan, Free from Mexico and Canada with USMCA, 37.5% plus base from Brazil.',
    'keywords': ['tariffs on musical instruments from china', 'tariffs on musical instruments from japan', 'tariffs on musical instruments from germany',
                 'tariffs on musical instruments canada', 'mexico tariffs on musical instruments', 'taiwan electronic keyboards duty',
                 'european union tariffs on acoustic guitars', 'hts chapter 92 customs duty'],
}
ia['intro'] = (
    'Each cell below is the base rate for that product group plus the extra duties for that country, minus any preference, from the current tariff schedule. '
    'No antidumping, countervailing, Section 232 or Section 338 duty reaches Chapter 92, so these totals are the full customs duty.\n\n'
    'Three things drive the totals. **China** pays the base rate plus 12.5% (2026 Section 301) plus 7.5% (List 4A) on 58 lines, so 20% to 28.7%; violins, music boxes '
    'and a few other List 4B lines pay 12.5% plus base. **Japan, South Korea, the EU and Taiwan** pay a flat floor in place of the base rate, 12.5% or 10%, because every '
    'Chapter 92 base rate is below it. **Indonesia, Malaysia, India and the UK** pay 10% plus the base rate, **Vietnam** 12.5% plus base, **Brazil** 37.5% plus base, and '
    '**Mexico and Canada** nothing with a USMCA claim.'
)
LABELS = {
    'China': 'Base rate + 12.5% 2026 Section 301 (9903.05.31) + 7.5% List 4A (9903.88.15) on 58 of 63 lines: 20% to 28.7%. The 5 List 4B lines (violins and other bowed instruments, 9202.90.60 string instruments, music boxes, two kinds of collapsible stands) pay base + 12.5%. No exclusion is in effect. The IEEPA duties ended February 24, 2026.',
    'Indonesia': 'Base rate + 10% (9903.05.45) on every line; no Chapter 92 line is on Indonesia\'s note 52(j) list. The 19% IEEPA reciprocal rate ended February 24, 2026.',
    'Japan': '12.5% in place of the base rate (9903.05.49) on every line, because all Chapter 92 rates are below 12.5%; the U.S.-Japan Trade Agreement (JP) does not lower it. The 15% all-in IEEPA rate ended February 24, 2026.',
    'Mexico': 'USMCA-qualifying: Free (note 52(h), 9903.05.94). Without a USMCA claim: base rate + 10% (9903.05.55). The 2025 IEEPA duty ended February 24, 2026.',
    'Taiwan': '10% in place of the base rate (9903.05.76) on every line, because all Chapter 92 rates are below 10%. UN Comtrade reports Taiwan\'s trade as "Other Asia, nes".',
    'Malaysia': 'Base rate + 10% (9903.05.54) on every line; no Chapter 92 line is on Malaysia\'s note 52(j) list. The 19% IEEPA reciprocal rate ended February 24, 2026.',
    'Germany': 'EU: 10% in place of the base rate (9903.05.39) on every line, because all Chapter 92 rates are below 10%. The 15% IEEPA rate ended February 24, 2026.',
    'Canada': 'USMCA-qualifying: Free (note 52(g), 9903.05.93). Without a USMCA claim: base rate + 10% (9903.05.29). No Chapter 92 line is on a Section 338 list (note 51). The 2025 IEEPA duty ended February 24, 2026.',
    'South Korea': '12.5% in place of the base rate (9903.05.71) on every line, because all Chapter 92 rates are below 12.5%; a KORUS claim does not lower it.',
    'Italy': 'EU: 10% in place of the base rate (9903.05.39) on every line, including accordions and wind instruments.',
    'France': 'EU: 10% in place of the base rate (9903.05.39) on every line, including clarinets, saxophones and other wind instruments.',
    'Sweden': 'EU: 10% in place of the base rate (9903.05.39) on every line, including electronic keyboards.',
    'United Kingdom': 'Base rate + 10% (9903.05.81) on every line. The 10% IEEPA rate ended February 24, 2026.',
    'Vietnam': 'Base rate + 12.5% (9903.05.84) on every line. The 20% IEEPA reciprocal rate ended February 24, 2026.',
    'Brazil': 'Base rate + 25% Brazil Section 301 (9903.05.01) + 12.5% (9903.05.27) = 37.5% plus base on every line; nothing in Chapter 92 is on the Brazil exemption list. The 2025 IEEPA duties (40% and 10%) ended February 24, 2026.',
    'India': 'Base rate + 10% (9903.05.44) on every line. The IEEPA duties on India ended February 24, 2026.',
    'Any other country': 'Countries outside the 60 Section 301 economies pay only the base rate. Others pay 10% or 12.5% on top (e.g. Thailand, the Philippines and Singapore +12.5%; Switzerland a 12.5% floor; EU members such as Austria and the Netherlands a 10% floor). Russia pays column 2 rates (35% to 50%) plus 12.5%; Nicaragua\'s separate Section 301 duty (9903.89.01) is 0% until January 1, 2027. AGOA countries are Free on base rates.',
}
for c in ia['countries']:
    c['rule']['label'] = LABELS[c['country']]
ia['assumptions'] = [a for a in ia['assumptions'] if not a.startswith('TODO')]
ia['assumptions'][1] = 'Ranges like "15% · 25.4%" mean the group has lines with different totals; select a cell to see which lines carry which rate.'
ia['assumptions'] += [
    'The IEEPA duties (9903.01.xx, 9903.02.xx) are still printed in the schedule but ended February 24, 2026, and the Section 122 surcharge (9903.03.01) expired July 23, 2026; neither is applied.',
    'No antidumping or countervailing duty order, Section 232 duty or Section 338 list reaches Chapter 92, so nothing is left out of the totals.',
    'Agency entry rules (Lacey Act plant declaration, CITES documents for rosewood, pernambuco, ivory and tortoiseshell, FWS wildlife clearance) do not change the duty and are listed on the Tariff engineering page.',
]
ia['exemptionCheck'] = (
    'Read U.S. notes 20, 29, 30, 50, 51 and 52 to Chapter 99 subchapter III and the Section 232 notes in the 2026 Revision 21. No Chapter 92 provision is on the note 52(b) '
    'general exemption list, the note 52(c) descriptions or any note 52(j) country list, on the Brazil exemption list (note 50(a)(ii)), on the Section 338 lists (note 51(b)), '
    'on the Russia 35% list (note 30(b)) or on any Section 232 list. China: List 4A (note 20(r)–(s)) names 58 Chapter 92 lines and List 4B (note 20(u), suspended) the other 5; '
    'no Chapter 92 line is on List 3, and the List 4A exclusions for acoustic pianos, guitars valued up to $100, harp sharping levers, electric guitar kits and synthesizer '
    'circuit boards are marked expired.'
)
ia['lastCheckedAt'] = TODAY
have = {s['id'] for s in ia['sources']}
for sid in ('eo-14389', 'procl-11012', 'procl-11048', 'hts-2025r22-ch99'):
    if sid not in have:
        ia['sources'].append(SRC[sid])
        have.add(sid)

# ---------------------------------------------------------------------------------------------------------------------
# Tariff engineering
# ---------------------------------------------------------------------------------------------------------------------
te = d['tariffEngineering']
te['h1'] = 'HTS Chapter 92: Musical Instruments — Import Documents & Ways to Lower Duty'
te['seo'] = {
    'title': 'Importing Musical Instruments: CITES Rosewood, Ivory, Lacey Act and Legal Ways to Lower Duty (HTS Ch. 92) | KoalaGains',
    'shortDescription': 'Tariff engineering for HTS Chapter 92: the $100 guitar value break, classification of kits, sets, amplifiers and pedals, USMCA, first-sale valuation, drawback and Chapter 98, plus the Lacey Act declaration, CITES rosewood and pernambuco rules, ivory and tortoiseshell bans and FWS clearance.',
    'keywords': ['cites compliance for musical instruments', 'cites rosewood guitar', 'lacey act guitar', 'cites musical instrument certificate',
                 'ivory piano keys illegal', 'first-sale-for-export valuation', 'gri 3b set unbundling', 'hts code for guitar parts'],
}
te['intro'] = (
    'The duty on an instrument depends on three facts: **what it is** (an acoustic guitar over or under $100 without its case, an electric guitar, a digital piano, a part, '
    'or an amplifier or pedal that belongs in Chapter 85), **where it was made** (China pays up to 28.7%, Mexico and Canada nothing with USMCA, Japan and the EU a flat floor) '
    'and **its value** (first sale, assists, the case). Those are the levers below.\n\n'
    'Instruments are also wildlife and plant products. Wooden instruments need a **Lacey Act** plant declaration naming each species; rosewood, ebony and other listed '
    'woods, pernambuco bows, **elephant ivory** keys and fittings, **tortoiseshell**, bone, mother-of-pearl and reptile skins bring in **CITES** and **FWS** rules, '
    'including bans on commercial imports of ivory and tortoiseshell. Each rule and lever links to its regulation.'
)
te['lastCheckedAt'] = TODAY
te['regulationsAsOf'] = '2026-10-08'
te['levers'] = [
    {'id': 'classify', 'title': 'Classify by type and value: acoustic vs electric, the $100 guitar break, instrument vs accessory',
     'saves': 'Up to 4.2 points on guitars (8.7% over $100 vs 4.5% at or under $100, both excluding the case); amplifiers (8518.40.20, Free) and effects pedals (8543.70.98.20, 2.6%) are not Chapter 92 goods',
     'appliesTo': 'Guitars (9202.90.20 / .40), electric instruments (9207), parts and accessories (9209), and accessories classified outside the chapter',
     'document': 'The unit value without the case on the invoice, a product description (acoustic, electric, keyboard), and for kits and sets the list of components. Unassembled instruments and complete kits are classified as the finished instrument (General Rule of Interpretation 2(a)); bows and sticks entered with their instrument go with it (Chapter 92 note 2). A binding ruling under 19 CFR part 177 settles a close case before import.',
     'caveat': 'Classification follows what the goods are; splitting the case from the guitar or undervaluing to land under $100 is not allowed. Amplifiers, microphones and other Chapter 85 accessories stay outside Chapter 92 only when not built into the instrument (note 1(b)).',
     'citations': [{'label': 'HTSUS Chapter 92 notes', 'url': CH92}, {'label': 'HTSUS General Rules of Interpretation', 'url': GN},
                   {'label': '19 CFR part 177 (rulings)', 'url': E19 + 'part-177'}]},
    {'id': 'usmca', 'title': 'Claim USMCA for Mexican and Canadian instruments',
     'saves': 'The base rate (up to 8.7%) plus the 10% 2026 Section 301 duty on Mexico (9903.05.55) or Canada (9903.05.29)',
     'appliesTo': 'Originating goods of Mexico and Canada, such as Mexican guitars and electric instruments',
     'document': 'A USMCA certification of origin from the importer, exporter or producer, in the importer\'s possession when the claim is made (19 CFR 182.12). Rules of origin: General Note 11.',
     'caveat': 'Instruments assembled in Mexico from Asian parts must meet the product-specific rule. The USMCA was not renewed at the July 1, 2026 joint review but remains in force.',
     'citations': [{'label': '19 CFR 182.12', 'url': E19 + 'section-182.12'}, {'label': 'HTSUS General Note 11 (USMCA)', 'url': GN},
                   {'label': 'HTSUS Ch. 99, subch. III, U.S. note 52(g)–(h)', 'url': CH99},
                   {'label': 'USTR statement on the USMCA joint review (July 1, 2026)', 'url': SRC['ustr-usmca-review']['url']}]},
    {'id': 'origin', 'title': 'Know the country of origin and the rate it carries',
     'saves': 'The gap between origins: 25% on a Chinese electric guitar vs 15% from Indonesia or Malaysia, 10% flat from the EU or Taiwan, Free from Mexico with USMCA',
     'appliesTo': 'All lines',
     'document': 'Production records showing where the instrument was substantially transformed (made into a new article with a new name, character and use), and the matching origin marking.',
     'caveat': 'Final assembly or finishing of a Chinese instrument elsewhere may not change its origin; CBP decides by substantial transformation, and a ruling can confirm it. Mis-declaring origin is fraud.',
     'citations': [{'label': '19 CFR 134.1 (country of origin)', 'url': E19 + 'section-134.1'}, {'label': '19 CFR part 177 (rulings)', 'url': E19 + 'part-177'}]},
    {'id': 'first-sale', 'title': 'Value at the first sale for export when you buy through a middleman',
     'saves': 'Duty on the middleman\'s markup: on a $300 guitar bought for $240 at the factory, 25% duty on $60 less ($15 per guitar from China)',
     'appliesTo': 'Instruments bought through a trading company or brand owner that bought them from the factory',
     'document': 'The factory-to-middleman invoice and proof the sale was at arm\'s length and the goods were clearly destined for the United States (19 U.S.C. 1401a; 19 CFR 152.103).',
     'caveat': 'Assists (molds, designs, parts supplied free) and royalties must be added to the value (19 CFR 152.103); CBP can ask for the full transaction chain.',
     'citations': [{'label': '19 CFR 152.103 (transaction value)', 'url': E19 + 'section-152.103'}]},
    {'id': 'chapter98', 'title': 'Use Chapter 98 for repairs abroad, American goods returned and instruments on tour',
     'saves': 'Duty only on the repair cost abroad (9802.00.40/.50), no duty on U.S.-made instruments returned unchanged (9801.00.10), and no duty on instruments brought in temporarily under bond or ATA Carnet (9813.00)',
     'appliesTo': 'Instruments sent abroad for repair, U.S.-made instruments coming back, and professional instruments for performances',
     'document': 'Export and repair records (19 CFR 10.8), proof of U.S. origin (19 CFR 10.1), or a temporary-importation bond or ATA Carnet (19 CFR 10.31); instruments with ivory, rosewood or other listed parts also need their CITES or musical instrument certificate.',
     'caveat': 'A repair that makes a new or different article does not qualify, and a TIB must be exported within the bond period.',
     'citations': [{'label': 'HTSUS Chapter 98', 'url': CH98}, {'label': '19 CFR 10.8', 'url': E19 + 'section-10.8'}, {'label': '19 CFR 10.1', 'url': E19 + 'section-10.1'},
                   {'label': '19 CFR 10.31', 'url': E19 + 'section-10.31'}, {'label': '19 CFR part 114 (ATA Carnets)', 'url': E19 + 'part-114'}]},
    {'id': 'drawback', 'title': 'Claim drawback when the instruments, or goods made from them, are exported',
     'saves': 'Generally 99% of the duties paid, including the Section 301 duties and the base rate, on goods re-exported unused or used to make exported goods',
     'appliesTo': 'All dutiable lines',
     'document': 'A drawback claim to CBP with the import and export records (19 CFR part 191); the claim is generally 99% of the eligible duties (19 CFR 191.51).',
     'caveat': 'Claims must be filed within five years of import, and the export or destruction must be documented.',
     'citations': [{'label': '19 CFR part 191', 'url': E19 + 'part-191'}, {'label': '19 CFR 191.51', 'url': E19 + 'section-191.51'}]},
]
te['rules'] = [
    {'id': 'lacey', 'agency': 'USDA APHIS',
     'title': 'Lacey Act: instruments of illegally taken wood may not be imported (16 U.S.C. 3372(a)); a plant import declaration with the scientific name, value, quantity and country of harvest of each wood is required (7 CFR 357.3). APHIS enforces it for pianos and string instruments (9201, 9202) since April 1, 2010, and for woodwinds, bagpipes, drums, fretted electric instruments and string- and woodwind-instrument parts since October 1, 2021; goods with no plant content, or where plant material is no more than 5% of the weight (and not a CITES or endangered species), are excepted (7 CFR 357.4)',
     'citations': [{'label': '16 U.S.C. 3372', 'url': USC_16_3372}, {'label': '7 CFR 357.3', 'url': E7 + 'section-357.3'}, {'label': '7 CFR 357.4', 'url': E7 + 'section-357.4'},
                   {'label': 'APHIS notice, 74 FR 45415 (phase IV)', 'url': SRC['fr-E9-21216']['url']}, {'label': 'APHIS notice, 86 FR 35259 (phase VI)', 'url': SRC['fr-2021-14155']['url']},
                   {'label': 'APHIS notice, 89 FR 47122 (proposed phase VII)', 'url': SRC['fr-2024-11901']['url']}]},
    {'id': 'cites-rosewood', 'agency': 'U.S. Fish and Wildlife Service / APHIS / CBP',
     'title': 'CITES timber: finished instruments, finished parts and finished accessories of Dalbergia rosewoods and bubinga are exempt under annotation #15 (since November 26, 2019); unfinished rosewood parts, fingerboard blanks and other listed woods need CITES export documents, and Brazilian rosewood (Dalbergia nigra, Appendix I since June 11, 1992) needs a pre-Convention certificate. Plant shipments clear through designated ports',
     'citations': [{'label': '50 CFR 23.92 (annotation exemptions)', 'url': E50 + 'section-23.92'}, {'label': '50 CFR 23.20', 'url': E50 + 'section-23.20'},
                   {'label': 'FWS notice: CoP18 changes to CITES listings (September 9, 2019)', 'url': FWS_2019},
                   {'label': 'FWS: wood, timber and other tree products', 'url': FWS_WOOD}, {'label': 'FWS Form 3-200-32 (pre-Convention plant certificates)', 'url': FWS_3_200_32}]},
    {'id': 'cites-pernambuco', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'Pernambuco (Paubrasilia echinata) bows: since March 5, 2026 annotation #10 covers all parts and derivatives except finished instruments, parts and accessories moved non-commercially without a change of ownership; wild-harvested pernambuco has a zero commercial quota, so a commercial import of a new bow needs a pre-Convention certificate (wood from before September 13, 2007) or a CITES permit for a non-wild source',
     'citations': [{'label': 'FWS Public Bulletin PB 26-001 (CoP20 amendments)', 'url': FWS_PB26}, {'label': 'FWS: pernambuco annotation #10 FAQs', 'url': FWS_PERN}]},
    {'id': 'ivory', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'African elephant ivory (piano keys, bow frogs and tips, bagpipe mounts): commercial import of worked ivory is prohibited; an instrument with ivory acquired before February 26, 1976 may cross the border non-commercially with a CITES musical instrument certificate and must not be sold abroad (50 CFR 17.40(e)(5)(i)). Asian elephant ivory and hawksbill tortoiseshell are endangered species and Appendix I',
     'citations': [{'label': '50 CFR 17.40(e)', 'url': E50 + 'section-17.40'}, {'label': '50 CFR 17.21 (endangered wildlife)', 'url': E50 + 'section-17.21'},
                   {'label': '81 FR 36388 (African elephant 4(d) rule, 2016)', 'url': SRC['fr-2016-13173']['url']},
                   {'label': 'FWS Form 3-200-88 (musical instrument certificate)', 'url': FWS_MIC}]},
    {'id': 'fws-clearance', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'Instruments and parts containing wildlife (ivory, bone, tortoiseshell, mother-of-pearl, snake or lizard skin, horsehair is domesticated and exempt) must be declared to FWS on Form 3-177, enter at a designated port and be cleared before CBP releases them; commercial importers need an FWS import/export license',
     'citations': [{'label': '50 CFR 14.61 (declaration)', 'url': E50 + 'section-14.61'}, {'label': '50 CFR 14.11 (designated ports)', 'url': E50 + 'section-14.11'},
                   {'label': '50 CFR 14.4 (domesticated animals)', 'url': E50 + 'section-14.4'}, {'label': '50 CFR 14.91 (license)', 'url': E50 + 'section-14.91'}]},
    {'id': 'cites-wildlife', 'agency': 'U.S. Fish and Wildlife Service',
     'title': 'Other CITES wildlife parts (for example python or lizard skin on drums and banjos, some shells) need the CITES export permit or re-export certificate for their appendix, and an import permit for Appendix I species',
     'citations': [{'label': '50 CFR 23.13', 'url': E50 + 'section-23.13'}, {'label': '50 CFR 23.20', 'url': E50 + 'section-23.20'}, {'label': '50 CFR 23.35', 'url': E50 + 'section-23.35'}]},
    {'id': 'fcc', 'agency': 'FCC / CBP',
     'title': 'Electronic instruments with digital circuitry (digital pianos, synthesizers, electronic drums) are generally Part 15 digital devices: they must meet the FCC equipment authorization rules before they are imported or marketed',
     'citations': [{'label': '47 CFR 2.1204 (import conditions)', 'url': E47 + 'section-2.1204'}, {'label': '47 CFR 15.101 (digital devices)', 'url': E47 + 'section-15.101'}]},
    {'id': 'cpsc', 'agency': 'CPSC',
     'title': 'Instruments designed or intended primarily for children 12 or younger are children\'s products (lead and testing rules, Children\'s Product Certificate); a general-use instrument stays general-use even when sold to schools. Toy instruments are heading 9503, not Chapter 92',
     'citations': [{'label': '16 CFR 1200.2', 'url': E16 + 'section-1200.2'}, {'label': '16 CFR part 1110', 'url': E16 + 'part-1110'}]},
    {'id': 'marking', 'agency': 'CBP',
     'title': 'Country-of-origin marking: each instrument, or its retail container when the article cannot be marked, must show the origin legibly and permanently enough to reach the ultimate purchaser',
     'citations': [{'label': '19 CFR 134.11', 'url': E19 + 'section-134.11'}, {'label': '19 CFR 134.41', 'url': E19 + 'section-134.41'}]},
    {'id': 'cbp-ch99', 'agency': 'CBP',
     'title': 'Report the Chapter 99 numbers with the Chapter 92 line: the 2026 Section 301 heading for the country (9903.05.20–9903.05.84) or the USMCA exemption (9903.05.93/.94), China List 4A (9903.88.15), Brazil (9903.05.01)',
     'citations': [{'label': 'HTSUS Ch. 99, subch. III, U.S. notes 20, 50 and 52', 'url': CH99}, {'label': 'CBP CSMS # 69302472 (Brazil Section 301)', 'url': SRC['csms-69302472']['url']}]},
    {'id': 'usmca-cert', 'agency': 'CBP',
     'title': 'USMCA claims: a certification of origin in the importer\'s possession, provided to CBP on request',
     'citations': [{'label': '19 CFR 182.12', 'url': E19 + 'section-182.12'}, {'label': 'HTSUS General Note 11', 'url': GN}]},
]
BASE_RULES = ['marking', 'cbp-ch99', 'usmca-cert']
GROUP_RULES = {
    '9201': ['lacey', 'cites-rosewood', 'ivory', 'fws-clearance'],
    '9202': ['lacey', 'cites-rosewood', 'cites-pernambuco', 'ivory', 'fws-clearance', 'cites-wildlife'],
    '9205': ['lacey', 'cites-rosewood', 'ivory', 'fws-clearance'],
    '9206': ['lacey', 'fws-clearance', 'cites-wildlife', 'cpsc'],
    '9207': ['lacey', 'cites-rosewood', 'fcc', 'cpsc'],
    '9208': ['cpsc'],
    '9209': ['lacey', 'cites-rosewood', 'cites-pernambuco', 'ivory', 'fws-clearance'],
}
NOTES = {
    '9201': 'Pianos need a Lacey Act declaration for their wood (since 2010). Old pianos with ivory keys may not be imported commercially; Brazilian rosewood cases need a pre-Convention certificate. Antique pianos over 100 years old are heading 9706, Free.',
    '9202': 'Guitars, violins and other string instruments need a Lacey Act declaration. Finished rosewood instruments are CITES-exempt; Brazilian rosewood is Appendix I; commercial imports of pernambuco bows need CITES documents; ivory fittings are restricted.',
    '9205': 'Woodwinds and bagpipes need a Lacey Act declaration (since 2021); African blackwood (Dalbergia melanoxylon) clarinets are finished instruments exempt under annotation #15. Bagpipes with ivory mounts need FWS clearance; harmoniums, accordions and harmonicas are in the proposed phase VII.',
    '9206': 'Drums need a Lacey Act declaration (since 2021); drums with wildlife skins need FWS clearance and CITES documents for listed species.',
    '9207': 'Fretted electric instruments need a Lacey Act declaration (since 2021); digital keyboards and synthesizers fall under FCC digital-device rules. Amplifiers and effects pedals are Chapter 85.',
    '9208': 'Music boxes, whistles and decoy calls: origin marking; toy versions are heading 9503.',
    '9209': 'Parts of string and woodwind instruments need a Lacey Act declaration (since 2021). Finished rosewood fingerboards and bridges ready to install are CITES-exempt finished parts; blanks are not. Strings and parts carry no extra wildlife rules unless they contain listed species.',
}
for g in te['groups']:
    g['label'] = GROUPS[g['heading']][0]
    g['ruleIds'] = BASE_RULES + GROUP_RULES[g['heading']]
    g['note'] = NOTES[g['heading']]

# Lacey declaration enforced: 9201, 9202 (phase IV); phase VI lines
LACEY = ('9201', '9202', '920590200', '92059040', '92060020', '9207900040', '920992', '92099920', '9209994040', '92099980')
for l in te['lines']:
    code = l['hts'].replace('.', '')
    h = code[:4]
    rules = list(BASE_RULES)
    if code.startswith(LACEY):
        rules.append('lacey')
    if h in ('9201', '9202', '9205', '9207', '9209'):
        rules.append('cites-rosewood')
    if code.startswith(('9202', '920992')):
        rules.append('cites-pernambuco')
    if h in ('9201', '9202', '9205') or code.startswith(('920991', '920992', '920999')):
        rules += ['ivory', 'fws-clearance']
    if h == '9206':
        rules += ['fws-clearance', 'cites-wildlife']
    if h == '9207':
        rules.append('fcc')
    if h in ('9206', '9207', '9208'):
        rules.append('cpsc')
    levers = []
    if code.startswith(('920290', '9207', '9209')):
        levers.append('classify')
    levers += ['origin', 'usmca', 'first-sale', 'chapter98', 'drawback']
    l['ruleIds'] = list(dict.fromkeys(rules))
    l['leverIds'] = levers
te['disclaimer'] = ('A checklist of where the rules are, with links to the regulations; not legal advice. CITES listings change at each Conference of the Parties; '
                    'check the species of every wood and animal part with FWS before importing.')

# ---------------------------------------------------------------------------------------------------------------------
# Final conclusion (FAQ)
# ---------------------------------------------------------------------------------------------------------------------
fc = d['finalConclusion']
fc['h1'] = 'HTS Chapter 92: Musical Instruments — Tariff FAQ'
fc['seo'] = {
    'title': 'Musical Instrument Tariffs FAQ: Guitars, Pianos, China, Japan, HS Codes & CITES (HTS Ch. 92) | KoalaGains',
    'shortDescription': 'Answers to what people search about musical instrument tariffs: are there tariffs on musical instruments, tariffs on guitars and pianos from China, Japan, Germany and Canada, brass instruments, HS codes for guitars, pianos, drums, parts and pedals, CITES rosewood guitars, ivory piano keys and the Lacey Act.',
    'keywords': ['are there tariffs on musical instruments', 'tariffs on musical instruments from china', 'tariffs on guitars from china', 'tariffs on musical instruments from japan',
                 'tariff on brass musical instruments', 'hs code for guitar', 'hs code for piano', 'hs code for drum set', 'hs code for guitar pedal',
                 'cites rosewood guitar', 'ivory piano keys illegal', 'lacey act guitar', 'hts chapter 92'],
}
fc['intro'] = 'Straight answers to the most common questions about U.S. tariffs on musical instruments, by country, by instrument and by HS code. Each answer links to the page with the full detail.'
fc['keyTakeaways'] = [
    'Musical instruments pay base rates of Free to 8.7% plus, since July 24, 2026, the 2026 Section 301 duty: +10% or +12.5% for 60 economies, a flat 10% for the EU and Taiwan and 12.5% for Japan and South Korea. USMCA goods from Mexico and Canada are Free.',
    'Chinese instruments pay 20% to 28.7% (base + 7.5% List 4A + 12.5%); violins, music boxes and a few other List 4B lines pay base + 12.5%. Brazil pays base + 37.5%. No Section 232, Section 338 or antidumping duty reaches Chapter 92.',
    'The 2025 IEEPA duties ended February 24, 2026 and the Section 122 surcharge July 23, 2026. Rosewood, pernambuco, ivory and tortoiseshell bring in CITES, FWS and Lacey Act rules.',
]
fc['lastCheckedAt'] = TODAY
fc['questionSource'] = 'Google search suggestions (United States, English), collected October 13, 2026'
fc['faqs'] = [
    {'id': 'any-tariffs', 'question': 'Are there tariffs on musical instruments?',
     'searchedAs': ['are there tariffs on musical instruments', 'us tariffs on musical instruments', 'tariffs on instruments', 'trump tariffs on instruments',
                    'are musical instruments exempt from tariffs', 'customs duty on musical instruments'],
     'answer': 'Yes. Every Chapter 92 line has a base rate of Free to 8.7%, and since July 24, 2026 goods of 60 economies pay the 2026 Section 301 duty on top: +10% or +12.5%, or a flat 10% (EU, Taiwan) or 12.5% (Japan, South Korea, Switzerland) in place of the base rate. No instrument is exempt from it. China also pays 7.5% on most lines and Brazil 25%. Mexican and Canadian instruments that qualify for USMCA are Free. The IEEPA tariffs ended February 24, 2026.',
     'link': 'industry-areas'},
    {'id': 'china', 'question': 'What is the tariff on musical instruments and guitars from China?',
     'searchedAs': ['tariffs on musical instruments from china', 'tariffs on guitars from china', 'tariffs on chinese guitars', 'china piano import tariffs'],
     'answer': 'Most Chinese instruments pay the base rate plus 7.5% (Section 301 List 4A, 9903.88.15) plus 12.5% (2026 Section 301, 9903.05.31): 24.7% on pianos, 25% on electric guitars, 25.4% on digital pianos and keyboards, 24.5% on acoustic guitars up to $100 and 28.7% over $100. Violins and other bowed instruments, 9202.90.60 string instruments, music boxes and two kinds of stands are on the suspended List 4B and pay base + 12.5% (15.7% on a violin).',
     'link': 'industry-areas'},
    {'id': 'japan', 'question': 'What is the tariff on musical instruments from Japan?',
     'searchedAs': ['tariffs on musical instruments from japan', 'tariffs on guitars from japan', 'japan guitar tariff', 'tariff on musical instruments from japan'],
     'answer': 'A flat 12.5% on every Chapter 92 line (9903.05.49), because Japanese goods with a column 1 rate under 12.5% pay 12.5% in place of it. That covers pianos, brass and woodwind instruments, guitars, keyboards and parts, including lines that are Free under the U.S.-Japan Trade Agreement. Japan supplied $135M in 2025, mostly pianos and wind instruments.',
     'link': 'industry-areas'},
    {'id': 'germany-eu', 'question': 'What is the tariff on musical instruments from Germany and the EU?',
     'searchedAs': ['tariffs on musical instruments from germany', 'european union tariffs on acoustic guitars', 'tariff on musical instruments from germany'],
     'answer': 'A flat 10% on every Chapter 92 line (9903.05.39): EU goods with a column 1 rate under 10% pay 10% in place of it, and every Chapter 92 rate is below 10%. That applies to German pianos and parts, Italian accordions, French woodwinds and Austrian brass alike. The 15% IEEPA rate ended February 24, 2026.',
     'link': 'industry-areas'},
    {'id': 'canada-mexico', 'question': 'Are there tariffs on musical instruments from Canada and Mexico?',
     'searchedAs': ['tariffs on musical instruments canada', 'tariffs on guitars from canada', 'guitar tariffs canada', 'mexico musical instrument customs duty'],
     'answer': 'Not on instruments that qualify for USMCA: they are Free, and exempt from the 2026 Section 301 duty (notes 52(g)–(h)). No Chapter 92 line is on Canada\'s Section 338 lists. Without a USMCA claim they pay the base rate plus 10%, for example 18.7% on a guitar over $100. This answers the U.S. tariff on imports; Canada\'s tariffs on U.S. guitars are set by Canada.',
     'link': 'industry-areas'},
    {'id': 'brass', 'question': 'What is the tariff on brass and band instruments?',
     'searchedAs': ['tariff on brass musical instruments', 'tariffs on brass instruments', 'tariffs on band instruments', 'tariffs on wind instruments', 'tariffs on brass instruments in usa'],
     'answer': 'Brass instruments (9205.10: trumpets, trombones, horns, tubas) have a 2.9% base rate, and clarinets, saxophones and flutes (9205.90.40) 4.9%. From China they pay 22.9% and 24.9%, from Taiwan or the EU 10%, from Japan 12.5%, from India 12.9% and 14.9%. Bagpipes and harmonicas are Free at base.',
     'link': 'industry-areas'},
    {'id': 'hs-guitar', 'question': 'What is the HS code for a guitar?',
     'searchedAs': ['hs code for guitar', 'hts code for guitar', 'harmonized tariff code guitar', 'tariff code for acoustic guitar', 'guitar tariff code'],
     'answer': 'Acoustic guitars are 9202.90: 9202.90.20 if valued not over $100 each excluding the case (4.5%), 9202.90.40 if over $100 (8.7%). Electric guitars and basses are 9207.90 (5%; 9207.90.00.40 for fretted string instruments). Unassembled guitars and complete kits are classified as guitars. Used guitars use the same codes; antiques over 100 years old are 9706 (Free).',
     'link': ''},
    {'id': 'hs-guitar-parts', 'question': 'What is the HS code for guitar strings, parts, pedals and cases?',
     'searchedAs': ['hs code for guitar parts', 'hs code for guitar string', 'hs code for guitar pedal', 'hs code for guitar amplifier', 'hs code for guitar case', 'hs code for guitar tuner'],
     'answer': 'Strings are 9209.30 (Free). Parts of acoustic guitars are 9209.92.80 (4.6%) and of electric guitars 9209.94.80 (2.7%); collapsible stands 9209.92.20 or 9209.94.40. Outside Chapter 92: effects pedals 8543.70.98.20 (2.6%), amplifiers 8518.40.20 (Free), clip-on tuners 9031.80.80.85, and instrument cases 4202.92.50 (4.2%) when entered separately.',
     'link': ''},
    {'id': 'hs-piano', 'question': 'What is the HS code for a piano or digital piano?',
     'searchedAs': ['hs code for piano', 'hs code for digital piano', 'hs code for grand piano', 'hs code for keyboard piano', 'hs code for electric piano', 'hs code 9207.10'],
     'answer': 'Acoustic upright pianos are 9201.10 and grand pianos 9201.20 (both 4.7%), with statistical suffixes by case height or length and for used pianos; harpsichords are 9201.90 (3.5%). Digital pianos, keyboards and synthesizers are 9207.10 (5.4%). Piano parts are 9209.91 (tuning pins Free, other parts 4.2%).',
     'link': ''},
    {'id': 'hs-drum', 'question': 'What is the HS code for drums and a drum set?',
     'searchedAs': ['hs code for drum set', 'hs code for drums', 'hs code for drum kit', 'hs code for drumstick', 'hs code for percussion musical instruments'],
     'answer': 'Acoustic drums and drum sets are 9206.00.20 (4.8%), cymbals 9206.00.40 (Free) and other percussion 9206.00.80 (5.3%). Electronic drum kits are 9207.90. Drumsticks entered with drums in normal numbers are classified with them (Chapter 92 note 2); drum pedals and holders for cymbals are 9209.99.10 (5.7%).',
     'link': ''},
    {'id': 'cites-rosewood', 'question': 'Do I need a CITES permit for a rosewood guitar?',
     'searchedAs': ['cites rosewood guitar', 'cites rosewood musical instruments', 'cites musical instrument exemption', 'cites brazilian rosewood guitar', 'cites musical instruments'],
     'answer': 'Not for a finished guitar of Indian, East Indian or other Dalbergia rosewood or bubinga: since November 26, 2019 CITES annotation #15 exempts finished musical instruments, finished parts and finished accessories. Unfinished rosewood parts and blanks still need CITES documents. Brazilian rosewood (Dalbergia nigra) is Appendix I: a guitar made with it needs a pre-Convention certificate showing the wood predates June 11, 1992. A Lacey Act declaration is still required.',
     'link': 'tariff-engineering'},
    {'id': 'mic', 'question': 'What is a CITES musical instrument certificate (passport)?',
     'searchedAs': ['cites musical instrument certificate', 'cites musical instrument passport', 'musical instrument passport', 'cites musical instrument certificate mic'],
     'answer': 'A passport-like CITES document (FWS Form 3-200-88) for traveling musicians whose instrument contains protected species, such as ivory, Brazilian rosewood or tortoiseshell. It is valid up to three years for multiple non-commercial border crossings, the holder must live in the United States, and the instrument may not be sold while abroad. Finished pernambuco bows moved non-commercially need no document since March 5, 2026.',
     'link': 'tariff-engineering'},
    {'id': 'ivory', 'question': 'Can I import a piano with ivory keys?',
     'searchedAs': ['ivory piano keys illegal', 'ivory piano keys', 'ivory piano keys for sale', 'ivory piano keys value'],
     'answer': 'Not for sale: commercial import of African elephant worked ivory is prohibited (50 CFR 17.40(e)). An instrument with ivory acquired before February 26, 1976 may be imported non-commercially, for example a musician\'s own piano or violin, with a CITES musical instrument certificate, if it is marked to match the certificate and not sold abroad. It must be declared to FWS and enter through a designated port.',
     'link': 'tariff-engineering'},
    {'id': 'lacey', 'question': 'What does the Lacey Act require for guitars and other instruments?',
     'searchedAs': ['lacey act guitar', 'lacey act requirements', 'lacey act gibson guitars', 'lacey act summary'],
     'answer': 'The Lacey Act bans importing instruments made of wood taken or traded in violation of law, and APHIS requires a plant import declaration naming each wood species, the value, quantity and country of harvest. It is enforced for pianos and acoustic string instruments since 2010 and for woodwinds, drums, electric guitars and string-instrument parts since October 1, 2021. Products with no plant content, or 5% or less plant material by weight (not CITES species), are excepted.',
     'link': 'tariff-engineering'},
    {'id': 'imports', 'question': 'Where does the U.S. import musical instruments from?',
     'searchedAs': ['musical instruments by country', 'us musical instrument imports', 'hts chapter 92', 'htsus chapter 92'],
     'answer': 'Mostly Asia: China $421M (30% of the $1.39B imported in 2025), Indonesia $233M, Japan $135M, Mexico $119M, Taiwan $84M, Malaysia $60M, Germany $59M, Canada $43M and South Korea $39M. Electric guitars and basses (9207.90, $349M) and digital pianos and synthesizers (9207.10, $203M) are the biggest products. Imports fell 15.2% from 2024.',
     'link': 'understand-industry'},
]

# ---------------------------------------------------------------------------------------------------------------------
json.dump(d, open(out, 'w'), ensure_ascii=False, indent=2)
print('wrote', out)
