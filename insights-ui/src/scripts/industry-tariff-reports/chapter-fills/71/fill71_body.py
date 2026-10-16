# Body of fill71.py (exec'd from it): chapter labels, overview, tariff updates, matrix, engineering, FAQ.
# Uses: d, src, add_sources, fmt_usd, pct, ecfr, ecfr_part, CH71_PDF, CH99_PDF, CH98_PDF, GN_PDF, TODAY, WT

# ---------------------------------------------------------------------------------------------------
# Trade figures (UN Comtrade summary written by pnpm tariff:fetch-trade)
# ---------------------------------------------------------------------------------------------------
ui = d['understandIndustry']
import os as _os
TRADE_FILE = f'{WT}/src/tariff-data/trade/chapter-71.json'
if not _os.path.exists(TRADE_FILE):
    TRADE_FILE = HERE + '/fake-trade.json'  # test only, until the real file arrives
trade = json.load(open(TRADE_FILE))
Y = trade['latestYear']
PY = trade['priorYear']
year_tot = {r['year']: r['totalUsd'] for r in trade['totalsByYear']}
total, prior_total = year_tot[Y], year_tot[PY]
by_c = {c['country']: c for c in trade['byCountry']}
by_h = {h['heading']: h['byYear'] for h in trade['byHeading']}
by_hs6 = {x['hs6']: x for x in trade['byHs6']}
hc = {}
for r in trade['byHeadingCountry']:
    hc.setdefault(r['heading'], {})[r['country']] = r['importsUsd']


def imp(country, year=None):
    c = by_c.get(country)
    if not c:
        return 0
    return c['importsUsd'] if year is None else c['byYear'].get(str(year), 0)


def himp(heading, year=None):
    return by_h.get(heading, {}).get(str(year or Y), 0)


def hcimp(heading, country):
    return hc.get(heading, {}).get(country, 0)


def h6(code):
    return by_hs6.get(code, {}).get('importsUsd', 0)


# ---------------------------------------------------------------------------------------------------
# Chapter + labels
# ---------------------------------------------------------------------------------------------------
TITLE = (
    'Natural or Cultured Pearls, Precious or Semiprecious Stones, Precious Metals, Metals Clad With Precious Metal, and Articles Thereof; '
    'Imitation Jewelry; Coin'
)
d['chapter']['title'] = TITLE
d['asOf'] = TODAY
SHORT = 'Gold, Diamonds, Jewelry & Precious Metals'

GROUP_LABELS = {
    '7101': ('Pearls, natural or cultured (loose or temporarily strung)', 'Pearls'),
    '7102': ('Diamonds, unmounted — rough, polished and industrial', 'Diamonds'),
    '7103': ('Rubies, sapphires, emeralds & other gemstones (unmounted)', 'Gemstones'),
    '7104': ('Lab-grown diamonds & other synthetic stones', 'Lab-grown & synthetic'),
    '7105': ('Diamond and gemstone dust & powder', 'Dust & powder'),
    '7106': ('Silver — bullion, doré, bars, powder', 'Silver'),
    '7107': ('Base metals clad with silver', 'Silver-clad metal'),
    '7108': ('Gold — bullion, doré, bars, powder, leaf, monetary gold', 'Gold'),
    '7109': ('Base metals or silver clad with gold', 'Gold-clad metal'),
    '7110': ('Platinum, palladium, rhodium, iridium, osmium & ruthenium', 'Platinum group metals'),
    '7111': ('Metals clad with platinum', 'Platinum-clad metal'),
    '7112': ('Precious-metal waste, scrap & ash', 'Scrap & sweepings'),
    '7113': ('Jewelry of gold, silver, platinum or clad metal', 'Fine jewelry'),
    '7114': ("Silverware & goldsmiths' wares (tableware, flatware)", 'Silverware'),
    '7115': ('Other precious-metal articles — minted bars, platinum gauze', 'Other precious-metal articles'),
    '7116': ('Articles of pearls & gemstones (strands, gemstone jewelry, carvings)', 'Pearl & gemstone articles'),
    '7117': ('Imitation (costume) jewelry', 'Costume jewelry'),
    '7118': ('Coins — bullion coins and other coin', 'Coins'),
}

BLURBS = {
    '7101': (
        'Natural and cultured pearls, loose or only temporarily strung for transport, are Free. Strung or set pearls are articles of heading '
        '7116 or jewelry of 7113. Natural pearls from the EU and Switzerland are exempt from the 2026 Section 301 duty; cultured pearls are '
        'not.',
        ['pearls', 'cultured pearls', 'natural pearls', 'akoya pearls', 'freshwater pearls', 'south sea pearls', 'loose pearls'],
    ),
    '7102': (
        'Every diamond line is Free — rough, polished (7102.39, split at 0.5 carat) and industrial. Rough diamonds (7102.10, 7102.21, '
        '7102.31) need a Kimberley Process certificate. Russian-origin diamonds, and Russian-mined stones of 0.5 carat or more cut elsewhere, '
        'are banned. The extra duty differs by country: Free from Belgium and the rest of the EU, +10% from India, +12.5% from Israel and the '
        'UAE, 50% from Canada (Section 338).',
        ['diamond', 'loose diamonds', 'polished diamonds', 'rough diamonds', 'cut diamonds', 'industrial diamonds', 'carbonado'],
    ),
    '7103': (
        'Rubies, sapphires, emeralds and other natural gemstones are Free, unworked or cut for jewelry; stones only sawn or roughly shaped '
        '(7103.10.40) and other worked stones (7103.99.50) pay 10.5%. EU and Swiss stones are exempt from the 2026 Section 301 duty.',
        ['ruby', 'sapphire', 'emerald', 'gemstones', 'tanzanite', 'opal', 'jade', 'tourmaline', 'amethyst', 'colored stones'],
    ),
    '7104': (
        'Lab-grown (synthetic) diamonds cut but not set and suitable for jewelry (7104.91.10) are Free; rough lab-grown diamonds (7104.21) pay '
        '3%, other worked lab-grown diamonds 6.4%. Lab-grown stones are on no Section 301 exception list, so EU and Swiss goods pay the duty too.',
        ['lab grown diamond', 'lab-grown diamonds', 'cvd diamond', 'hpht diamond', 'synthetic diamond', 'moissanite', 'cubic zirconia', 'piezo-electric quartz'],
    ),
    '7105': (
        'Natural and synthetic diamond dust and powder (abrasives) and other gemstone powder are Free.',
        ['diamond powder', 'diamond dust', 'synthetic diamond powder', 'diamond grit'],
    ),
    '7106': (
        'Silver bullion and doré and cast silver bars of 99.5% or more (7106.92.10) are Free; other unwrought and semi-manufactured silver 3%. '
        'Only unwrought bullion and doré (7106.91.10) is exempt from the 2026 Section 301 duty, and Canadian silver bars are on the 50% '
        'Section 338 list.',
        ['silver bullion', 'silver bars', 'silver dore', 'silver grain', 'silver powder', 'silver sheet', 'silver wire'],
    ),
    '7107': ('Base metal clad with silver, not further worked than semi-manufactured: 3.3%.', ['silver clad', 'silver-clad copper', 'silver clad sheet']),
    '7108': (
        'Gold bullion and doré (7108.12.10), gold bars of 99.5% or more marked only with weight and purity (7108.13.55), gold leaf, powder and '
        'monetary gold are Free; other unwrought and semi-manufactured gold 4.1%. Every 7108 line is exempt from the 2026 Section 301 duty, '
        'but Chinese gold still pays the 25% List 3 duty.',
        ['gold bullion', 'gold bars', 'gold bar', 'kilobar', 'gold dore', 'gold leaf', 'gold powder', 'gold grain', 'gold wire'],
    ),
    '7109': ('Base metal or silver clad with gold (gold-filled stock), not further worked than semi-manufactured: 6%.', ['gold filled', 'gold clad', 'rolled gold']),
    '7110': (
        'Platinum, palladium, rhodium, iridium, osmium and ruthenium — unwrought, powder or semi-manufactured — are Free and exempt from the 2026 '
        'Section 301 duty.',
        ['platinum', 'palladium', 'rhodium', 'iridium', 'ruthenium', 'osmium', 'platinum sponge', 'palladium bars', 'pgm'],
    ),
    '7111': ('Base metals, silver or gold clad with platinum, not further worked than semi-manufactured: 10%.', ['platinum clad']),
    '7112': (
        'Waste, scrap and ash of gold, silver and platinum metals for refining are Free. Platinum scrap and precious-metal ash are exempt from '
        'the 2026 Section 301 duty; gold and silver scrap are not.',
        ['gold scrap', 'silver scrap', 'platinum scrap', 'precious metal scrap', 'sweepings', 'jewelry scrap', 'catalytic converter scrap'],
    ),
    '7113': (
        'Fine jewelry pays 5%–13.5%: gold, platinum or other precious-metal rings, earrings, necklaces and bracelets mostly 5.5% (rope '
        'necklaces 5%, mixed-link 5.8%, chain by the length 7%); silver jewelry 5% (13.5% if valued not over $18 a dozen, 6.3% for chain); '
        'gold-clad jewelry 5.2%–7%.',
        ['gold jewelry', 'gold ring', 'gold necklace', 'gold chain', 'diamond ring', 'engagement ring', 'earrings', 'bracelet', 'sterling silver jewelry', 'platinum ring'],
    ),
    '7114': (
        "Silversmiths' and goldsmiths' wares: knives with silver handles 2.8%, forks 2.7%, spoons 3.3%–3.5%, sterling tableware 3.3%, other "
        'silver articles 3%, articles of other precious metal 7.9%, of clad metal 3%.',
        ['sterling silver flatware', 'silverware', 'silver tableware', 'silver tea set', 'silver bowl'],
    ),
    '7115': (
        'Minted bars and rounds of 99.5% gold, silver or other precious metal marked only with weight and purity (7115.90.05) are Free and '
        'exempt from the 2026 Section 301 duty; platinum catalyst gauze 4%, other gold articles 3.9%, silver 3%, others 4%.',
        ['minted gold bar', 'silver round', 'platinum gauze', 'precious metal articles', 'gold medal'],
    ),
    '7116': (
        'Articles of pearls and gemstones: strands of natural pearls 3.3%, cultured pearls 5.5%; jewelry of precious or semiprecious stones '
        '3.3% (not over $40 a piece) or 6.5%; graded semiprecious beads strung for transport 2.1%, figurines 4.5%, other 10.5%.',
        ['pearl necklace', 'pearl strand', 'beaded jewelry', 'gemstone bracelet', 'jade carving', 'gemstone beads'],
    ),
    '7117': (
        'Costume jewelry of base metal pays up to 11% (cuff links 8%, chain by the length 8% or 11%, other 11%); of plastics, glass and other '
        'materials 7.2% or 11%; religious articles 3.3%–3.9%; toy jewelry valued not over 8 cents a piece Free.',
        ['costume jewelry', 'fashion jewelry', 'imitation jewelry', 'gold plated jewelry', 'cuff links', 'rosary', 'beaded necklace', 'hair jewelry'],
    ),
    '7118': (
        'Coin is Free: gold bullion coins such as the Canadian Maple Leaf (7118.90) and other legal-tender coin are also exempt from the 2026 '
        'Section 301 duty. Coin that is not legal tender (7118.10) is not, and from Canada it is on the 50% Section 338 list.',
        ['gold coins', 'silver coins', 'bullion coins', 'maple leaf', 'krugerrand', 'commemorative coins', 'coin'],
    ),
}

ov = d['overview']
ov['h1'] = f'HTS Chapter 71: {SHORT} — Tariff Rates'
for g in ov['productGroups']:
    g['label'] = GROUP_LABELS[g['heading']][0]
    g['blurb'], g['searchExamples'] = BLURBS[g['heading']]

for e in ov['spiLegend']:
    if e['code'] == 'A':
        e['name'] = 'Generalized System of Preferences (GSP) — expired December 31, 2020'
    if e['code'] == 'A*':
        e['name'] = 'GSP, some beneficiary countries excluded — expired December 31, 2020'
    if e['code'] == 'A+':
        e['name'] = 'GSP, least-developed beneficiary countries — expired December 31, 2020'
    if e['code'] == 'D':
        e['name'] = 'African Growth and Opportunity Act (AGOA) — in force through December 31, 2026'

ov['notes'] = {
    'chapterNotes': (
        '**Note 1.** Subject to note 1(a) to section VI and except as provided below, all articles consisting wholly or partly: (a) of natural '
        'or cultured pearls or of precious or semiprecious stones (natural, synthetic or reconstructed), or (b) of precious metal or of metal '
        'clad with precious metal, are to be classified in this chapter.\n\n'
        '**Note 2.** (a) Headings 7113, 7114 and 7115 do not cover articles in which precious metal or metal clad with precious metal is present '
        'as minor constituents only, such as minor fittings or minor ornamentation (for example, monograms, ferrules and rims), and paragraph (b) '
        'of the foregoing note does not apply to such articles. (b) Heading 7116 does not cover articles containing precious metal or metal clad '
        'with precious metal (other than as minor constituents).\n\n'
        '**Note 3.** This chapter does not cover: (a) amalgams of precious metal or colloidal precious metal (heading 2843); (b) sterile '
        'surgical suture materials, dental fillings or other goods of chapter 30; (c) goods of chapter 32 (for example, lustres); (d) supported '
        'catalysts (heading 3815); (e) articles of heading 4202 or 4203 referred to in note 3(B) to chapter 42; (f) articles of heading 4303 or '
        '4304; (g) goods of section XI (textiles and textile articles); (h) footwear, headgear or other articles of chapter 64 or 65; (ij) '
        'umbrellas, walking-sticks or other articles of chapter 66; (k) abrasive goods of heading 6804 or 6805 or chapter 82, containing dust or '
        'powder of precious or semiprecious stones (natural or synthetic); articles of chapter 82 with a working part of precious or '
        'semiprecious stones (natural, synthetic or reconstructed); machinery, mechanical appliances or electrical goods, or parts thereof, of '
        'section XVI. However, articles and parts thereof, wholly of precious or semiprecious stones (natural, synthetic or reconstructed) remain '
        'classified in this chapter, except unmounted worked sapphires and diamonds for styli (heading 8522); (l) articles of chapter 90, 91 or '
        '92 (scientific instruments, clocks and watches, musical instruments); (m) arms or parts thereof (chapter 93); (n) articles covered by '
        'note 2 to chapter 95; (o) articles classified in chapter 96 by virtue of note 4 to that chapter; or (p) original sculptures or statuary '
        "(heading 9703), collectors' pieces (heading 9705) or antiques of an age exceeding one hundred years (heading 9706), other than natural or "
        'cultured pearls or precious or semiprecious stones.\n\n'
        '**Note 4.** (a) The expression "precious metal" means silver, gold and platinum. (b) The expression "platinum" means platinum, iridium, '
        'osmium, palladium, rhodium and ruthenium. (c) The expression "precious or semiprecious stones" does not include any of the substances '
        'specified in note 2(b) to chapter 96.\n\n'
        '**Note 5.** For the purposes of this chapter, any alloy (including a sintered mixture and an inter-metallic compound) containing '
        'precious metal is to be treated as an alloy of precious metal if any one precious metal constitutes as much as 2 percent, by weight, of '
        'the alloy. Alloys of precious metal are to be classified according to the following rules: (a) an alloy containing 2 percent or more, '
        'by weight, of platinum is to be treated as an alloy of platinum; (b) an alloy containing 2 percent or more, by weight, of gold but no '
        'platinum, or less than 2 percent, by weight, of platinum, is to be treated as an alloy of gold; (c) other alloys containing 2 percent or '
        'more, by weight, of silver are to be treated as alloys of silver.\n\n'
        '**Note 6.** Except where the context otherwise requires, any reference in the tariff schedule to precious metal or to any particular '
        'precious metal includes a reference to alloys treated as alloys of precious metal or of the particular metal in accordance with the '
        'rules in note 5 above, but not to metal clad with precious metal or to base metal or non-metals plated with precious metal.\n\n'
        '**Note 7.** Throughout the tariff schedule the expression "metal clad with precious metal" means material made with a base of metal '
        'upon one or more surfaces of which there is affixed by soldering, brazing, welding, hot-rolling or similar mechanical means a covering '
        'of precious metal. Except where the context otherwise requires, the expression also covers base metal inlaid with precious metal.\n\n'
        '**Note 8.** Subject to note 1(a) to section VI, goods answering to a description in heading 7112 are to be classified in that heading '
        'and in no other heading of the tariff schedule.\n\n'
        '**Note 9.** For the purposes of heading 7113, the expression "articles of jewelry" means: (a) any small objects of personal adornment '
        '(for example, rings, bracelets, necklaces, brooches, earrings, watch chains, fobs, pendants, tie pins, cuff links, dress studs, '
        'religious or other medals and insignia); and (b) articles of personal use of a kind normally carried in the pocket, in the handbag or '
        'on the person (for example, cigar or cigarette cases, snuff boxes, cachou or pill boxes, powder boxes, chain purses or prayer beads). '
        'These articles may be combined or set, for example, with natural or cultured pearls, precious or semiprecious stones, synthetic or '
        'reconstructed precious or semiprecious stones, tortoise shell, mother-of-pearl, ivory, natural or reconstituted amber, jet or coral.\n\n'
        "**Note 10.** For the purposes of heading 7114, the expression \"articles of goldsmiths' or silversmiths' wares\" includes such articles "
        'as ornaments, tableware, toilet-ware, smokers\' articles and other articles of household, office or religious use.\n\n'
        '**Note 11.** For the purposes of heading 7117, the expression "imitation jewelry" means articles of jewelry within the meaning of '
        'paragraph (a) of note 9 above (but not including buttons or other articles of heading 9606, or dress combs, hair slides or the like, '
        'or hairpins, of heading 9615), not incorporating natural or cultured pearls, precious or semiprecious stones (natural, synthetic or '
        'reconstructed) nor (except as plating or as minor constituents) precious metal or metal clad with precious metal.\n\n'
        '**Subheading notes.** 1. For the purposes of subheadings 7106.10, 7108.11, 7110.11, 7110.21, 7110.31 and 7110.41, the expressions '
        '"powder" and "in powder form" mean products of which 90 percent or more by weight passes through a sieve having a mesh aperture of 0.5 '
        'mm. 2. Notwithstanding the provisions of note 4(b), for the purposes of subheadings 7110.11 and 7110.19, the expression "platinum" does '
        'not include iridium, osmium, palladium, rhodium or ruthenium. 3. For the classification of alloys in the subheadings of heading 7110, '
        'each alloy is to be classified with that metal, platinum, palladium, rhodium, iridium, osmium or ruthenium, which predominates by weight '
        'over each other of these metals.'
    ),
    'additionalUsNotes': (
        '**1.** For the purposes of subchapter II, unless the context otherwise requires: (a) the term "unwrought" refers to metals, whether or '
        'not refined, in the form of ingots, blocks, lumps, billets, cakes, slabs, pigs, cathodes, anodes, briquettes, cubes, sticks, grains, '
        'sponge, pellets, shot and similar manufactured primary forms, but does not cover rolled, forged, drawn or extruded products, tubular '
        'products or cast or sintered forms which have been machined or processed otherwise than by simple trimming, scalping or descaling; (b) '
        'the term "semimanufactured" refers to wrought metal products in the form of bars, rods, sections, plates, sheets, strips, wire, tubes, '
        'pipes and hollow bars, and to powder (other than primary metals in powder form); (c) the term "waste and scrap" refers to materials and '
        'articles which are second-hand or waste or refuse, or are obsolete, defective or damaged, and which are fit only for the recovery of '
        'the metal content or for use in the manufacture of chemicals. It includes residues and ashes of a kind used principally for the '
        'recovery of precious metals, but does not include metals in unwrought form or metal-bearing materials provided for in heading 2616.\n\n'
        '**2.** Coin provided for in heading 7118 which is currently in circulation in any country and is imported for monetary purposes shall '
        'be admitted without formal customs consumption entry or the payment of duty. This does not affect any requirements under other '
        'provisions of law to the effect that transfers of coin into or through the United States, in an amount exceeding $10,000 on any one '
        'occasion, shall be reported as described therein.\n\n'
        '**3.** (a) Notwithstanding any provision in additional U.S. note 5 to chapter 91, any article of jewelry provided for in heading 7113 '
        'which is the product of the Virgin Islands, Guam, or American Samoa (including any such article which contains any foreign component) '
        'shall be eligible for the benefits provided in paragraph (h) of additional U.S. note 5 to chapter 91, subject to the provisions and '
        'limitations of that note and of paragraphs (b), (c), and (d) of this note. (b) Notwithstanding additional U.S. Note 5(h)(ii)(B) to '
        'chapter 91, articles of jewelry subject to this note shall be subject to a limitation of 10,000,000 units. (c) Nothing in this note '
        'shall result in an increase or a decrease in the aggregate amount referred to in paragraph (h)(iii) of, or the quantitative limitation '
        'otherwise established pursuant to the requirements of, additional U.S. note 5 to chapter 91. (d) Nothing in this note shall be '
        'construed to permit a reduction in the amount available to watch producers under paragraph (h)(iv) of additional U.S. note 5 to '
        'chapter 91. (e) The Secretary of Commerce and the Secretary of the Interior shall issue such regulations, not inconsistent with the '
        'provisions of this note and additional U.S. note 5 to chapter 91, as the Secretaries determine necessary to carry out their respective '
        'duties under this note. Such regulations shall not be inconsistent with substantial transformation requirements but may define the '
        'circumstances under which articles of jewelry shall be deemed to be ‘units’ for purposes of the benefits, provisions, and '
        'limitations of additional U.S. note 5 to chapter 91. (f) Notwithstanding any other provision of law, any article of jewelry provided '
        'for in Heading 7113 that is assembled in the Virgin Islands, Guam, or American Samoa by a jewelry manufacturer or jewelry assembler '
        'that commenced jewelry manufacturing or jewelry assembly operations in the Virgin Islands, Guam, or American Samoa after August 9, '
        '2001, shall be treated as a product of the Virgin Islands, Guam, or American Samoa for purposes of this note and General Note 3(a)(iv) '
        'of this Schedule if such article is entered no later than 18 months after such jewelry manufacturer or jewelry assembler commenced '
        'jewelry manufacturing or jewelry assembly operations in the Virgin Islands, Guam, or American Samoa.\n\n'
        '**Statistical notes.** 1. For the purposes of subheading 7113.19.50, the expression "ISO standard platinum" means platinum meeting the '
        "International Organization for Standardization's standard for platinum containing at least 85 percent pure platinum or at least 50 "
        'percent pure platinum with a combined content of at least 95 percent platinum group metals iridium, osmium, palladium, rhodium, or '
        'ruthenium. 2. For the purposes of reporting under statistical numbers 7113.19.5021 through 7113.19.5091, each piece is individually '
        'counted. For example, a pair of earrings is counted as two pieces and a necklace and its pendant are counted as one piece.'
    ),
}

